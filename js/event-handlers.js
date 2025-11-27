// @ts-check
/// <reference path="./types.d.ts" />

import { getFakeUsers, getBrand, getModel, getCarBrands, saveModels } from './data.js';
import { events, initDispatchEvent, on } from './events.js';
import { handleGetFakeModels } from './form-handlers.js';
import { Maybe, compose, getFullHeightOfChildren, initModalCloseHandler, removeAnimatedModal } from './helpers.js';
import { doneIcon, hideIcon, progressIcon, showIcon } from './icons.js';
import { getModelsTemplate, renderGetModelsForm, renderModal } from './renders.js';

export function handleDropdown(event) {
  const dropdown = event.target.closest(".dropdown");
  if (dropdown && event.target.closest("#dropdown__action-button")) {
    dropdown.classList.toggle("dropdown_open");
  } else {
    document.querySelectorAll(".dropdown").forEach(dropdown => {
      dropdown.classList.remove("dropdown_open");
    });
  }
}

export function handleToggleFormVisible(event) {
  /** @type {HTMLFormElement | null} */
  const form = document.querySelector(".create-form");
  const minimizeButton = event.target.closest("#minimize-button");
  if (form && minimizeButton) {
    const formHeight = form.offsetHeight;
    form.style.height = formHeight > 0 ? '0' : getFullHeightOfChildren(form) + "px";
    minimizeButton.innerHTML = parseInt(form.style.height) > 0
      ? 'Hide ' + hideIcon() : 'Show ' + showIcon();
  }
}

export const handleClick = compose(
  handleDropdown,
  handleToggleFormVisible,
)

// These handler functions below run by custom events

/**
 * 
 * @param {ShowEditBrandFormParams} params
 */
function handleShowEditBrandForm({ brandId }) {
  // history.pushState(null, '', `#/todos/edit?groupId=${groupId}&todoId=${todoId}`);
  window.location.hash = `#/cars/${brandId}/edit`;
}

/**
 * 
 * @param {ShowEditModelFormParams} params
 */
function handleShowEditModelForm({ brandId, modelId }) {
  // history.pushState(null, '', `#/todos/edit?groupId=${groupId}&todoId=${todoId}`);
  window.location.hash = `#/cars/${brandId}/${modelId}/edit`;
}

/**
 * 
 * @param {ToggleCarParams} details
 * @returns 
 */
function handleToggleModel({ brandId, modelId }) {
  const model = getModel({ brandId: brandId, modelId: modelId });
  if (!model) return;
  model.reserved = !model.reserved;
  saveModels();
  Maybe.of(document.querySelector(`.model[data-id="${modelId}"]`))
    .bind(modelElement => modelElement.querySelector(".model__title"))
    .do(subtitle => subtitle.classList.toggle("model-title_reserved"))
    .bind(() => document.querySelector(`.model[data-id="${modelId}"] .status__text`))
    .do(status => status.innerHTML = model.reserved ? `${doneIcon()} Reserved` : `${progressIcon()} Available`)
    .bind(() => document.querySelector(`#model-filter`))
    .bind(filter => filter instanceof HTMLSelectElement ? filter.value : null)
    .do(filter => {
      if (filter === 'all') return;
      const modelElement = document.querySelector(`.model[data-id="${modelId}"]`);
      if (!modelElement) return;
      if (filter === 'true' && !model.reserved) modelElement.remove();
      else if (filter === 'false' && model.reserved) modelElement.remove();
    })
}

/**
 * 
 * @param {RemoveCarParams} details
 */
function handleRemoveModel({ brandId, modelId }) {
  if (!confirm("Are you sure?")) return;
  Maybe.of(getBrand({ id: brandId }))
    .do(brand => brand.models = brand.models.filter(model => model.id !== Number(modelId)))
    .do(() => saveModels())
    .bind(() => document.querySelector(`.model[data-id="${modelId}"]`))
    .do(modelElement => modelElement.remove());
}

/**
 * 
 * @param {RemoveBrandParams} details
 */
function handleRemoveBrand({ brandId }) {
  if (!confirm("Are you sure?")) return;
  Maybe.of(getCarBrands())
    .bind(brands => brands.filter(brand => brand.id !== Number(brandId)))
    .do(brands => saveModels(brands))
    .bind(() => document.querySelector(`.brand[data-id="${brandId}"]`))
    .do(brandElement => brandElement.remove())
    .catch(() => window.location.hash = "");
}

function handleRemoveAllBrands() {
  if (!confirm("Are you sure?")) return;
  saveModels([]);
  Maybe.of(document.querySelector(".brands__list"))
    .do(brandList => brandList.innerHTML = "");
}

/**
 * 
 * @param {RemoveAllModelsParams} details
 */
function handleRemoveAllModels({ brandId }) {
  if (!confirm("Are you sure?")) return;
  Maybe.of(getBrand({ id: brandId }))
    .do(brand => brand.models = [])
    .do(() => saveModels())
    .bind(() => document.querySelector(".models__list"))
    .do(modelList => modelList.innerHTML = "");
}

/**
 * 
 * @param {ShowGetFakeModelsParams} details
 */
async function handleShowGetFakeModels({ brandId }) {
  Maybe.of(await getFakeUsers())
    .bind(users => renderModal(renderGetModelsForm(users, brandId)))
    .bind(modal => modal.querySelector(".modal"))
    .do(modal => {
      modal.classList.add("modal_enter");
      document.body.append(modal);
      initModalCloseHandler(modal);
      const form = modal.querySelector("form");
      if (!form) return null;
      form.addEventListener("submit", (e) =>
        handleGetFakeModels(e, () => removeAnimatedModal(modal)))
    })
    .catch(() => alert("Something went wrong. Try again later."))
}

function handleNoItems() {
  Maybe.of(document.querySelector(".create-form"))
    .bind(form => form instanceof HTMLFormElement ? form : null)
    .bind(form => form.style.height = getFullHeightOfChildren(form) + "px")
    .bind(() => document.querySelector("#minimize-button"))
    .do(minimizeButton => minimizeButton.innerHTML = 'Hide ' + hideIcon())
    .catch(() => console.log("Something went wrong. Try again later."))
}

/**
 * @param {FilterModelsParams} details
 */
function handleFilterModels({ brandId, reserved }) {
  const brand = getBrand({ id: brandId });
  if (!brand) return;
  const modelList = document.querySelector(".models__list");
  if (!modelList) return;
  modelList.innerHTML = getModelsTemplate({
    ...brand,
    models: brand.models.filter(model => reserved === 'all' || String(model.reserved) === reserved),
  });
}


export function initCustomEvents() {
  initDispatchEvent();
  on(events.toggleModel, handleToggleModel);
  on(events.removeModel, handleRemoveModel);
  on(events.removeBrand, handleRemoveBrand);
  on(events.removeAllBrands, handleRemoveAllBrands);
  on(events.removeAllModels, handleRemoveAllModels);
  on(events.showGetFakeModels, handleShowGetFakeModels);
  on(events.showEditBrandForm, handleShowEditBrandForm);
  on(events.showEditModelForm, handleShowEditModelForm);
  on(events.filterModels, handleFilterModels);
}

/**
 * 
 * @param {Element} list 
 */
export function observeList(list) {
  if (!(list instanceof HTMLElement)) throw new Error("list is not an instance of HTMLElement");
  const observer = new MutationObserver((mutations) => {
    if (mutations.length === 0) return;
    if (mutations.some(mutation => mutation.type === "childList")) {
      if (list.children.length === 0) {
        list.innerHTML = `<h5 class="no-entries">No entries yet. Add new one using the form above.</h5>`;
        handleNoItems();
      }
      else Maybe.of(list.querySelector(".no-entries"))
        .do(noEntries => {
          if (mutations.filter(mutation => mutation.type === "childList").some(mutation => {
            return [...mutation.addedNodes]
              .filter(node => node instanceof HTMLElement)
              .some(node => node.classList.contains("list__item"))
          })) noEntries.remove()
        })
    }
  });
  observer.observe(list, {
    childList: true,
  });
}