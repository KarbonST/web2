// @ts-check
/// <reference path="./types.d.ts" />

import { getCarBrands } from './data.js';
import { observeList } from './event-handlers.js';
import { dispatchShowGetFakeModels, dispatchRemoveAllBrands, dispatchRemoveAllModels, dispatchRemoveBrand, dispatchRemoveModel, dispatchShowEditBrandForm, dispatchShowEditModelForm, dispatchToggleModel } from './events.js';
import { handleAddModel, handleAddBrand, handleEditBrand, handleEditModel } from './form-handlers.js';
import { Maybe, fragment } from './helpers.js';
import { addIcon, backIcon, doneIcon, downloadIcon, editIcon, showIcon, progressIcon, removeIcon, hideIcon, homeIcon } from "./icons.js";

export function renderNotFound() {
  return fragment/*html*/`
    <h1 class="title container__title">PAGE NOT FOUND</h1>
  `;
}

export function renderBrands() {
  const brands = getCarBrands();
  const page = fragment/*html*/`
    <div class="brands">
      <div class="header">
        <h1 class="title header__title">Brands and Models</h1>
        <div class="header__toolbar toolbar">
          <button class="button button_danger" onclick="${dispatchRemoveAllBrands()}">
            ${removeIcon()}
            Remove all
          </button>
          <button class="button button_secondary toolbar__hide-button" id="minimize-button">
            ${document.querySelector(".create-form")?.offsetHeight > 0 || brands.length === 0
      ? 'Hide ' + hideIcon() : 'Show ' + showIcon()}
          </button>
        </div>
        <form class="brands__create-form create-form" style="height: ${brands.length === 0 ? 'auto' : 0}">
          <label class="create-form__form-label form-label">
            <span class="create-form__form-label-text">Add new brand</span>
            <input class="input" type="text" placeholder="Add brand title" name="title" ${validation('title')}>
          </label>
          <label class="create-form__form-label form-label">
            <span class="create-form__form-label-text">Add description</span>
            <input class="input" type="text" placeholder="Add description" name="description" ${validation('description')}>
          </label>          
          <button class="button button_primary create-form__add-button" type="submit">
            ${addIcon()}
            Add
          </button>
        </form>
      </div>
      <div class="brands__list list">
        ${
      brands.length === 0
          ? /*html*/`<h5 class="no-entries">No entries yet. Add new one using the form above.</h5>`
          : getBrandsTemplate(brands)}
      </div>
    </div>
  `;
  Maybe.of(page.querySelector('.create-form'))
    .bind(form => form instanceof HTMLFormElement ? form : null)
    .do(form => form.addEventListener("submit", handleAddBrand))
  Maybe.of(page.querySelector('.list')).do(observeList)
  return page;
}

export function getBrandsTemplate(brands) {
  return brands.map(brand => {
    return /*html*/`
      <div class="list__item card brand" data-id="${brand.id}">
        <div class="card__card-header card-header">
          <a class="card__link link" href="#/models/${brand.id}">
            <h3 class="card-title card__card-title brand__title">
              ${brand.title}
            </h3>
            <div class="card__description description">${brand.description}</div>
          </a>
        </div>
        <div class="card__toolbar toolbar">
          <button class="button button_primary" onclick="${dispatchShowEditBrandForm({brandId: brand.id})}">
            ${editIcon()}
            Edit
          </button>
          <button class="button button_danger" onclick="${dispatchRemoveBrand({brandId: brand.id})}">
            ${removeIcon()}
            Remove
          </button>
        </div>
      </div>
    `;
  }).join("");
}

/**
 * 
 * @param {Brand} brand
 */
export function renderModels(brand) {
  const page = fragment/*html*/`
    <div class="models" data-brand-id="${brand.id}">
      <div class="header">
        <h1 class="title header__title">${brand.title}</h1>
        <div class="header__toolbar toolbar">
          <button class="button button_primary" onclick="window.location.hash = ''">
            ${homeIcon()}
            Home
          </button>
          <div class="dropdown">
            <div class="dropdown__action">
              <button class="button button_primary" id="dropdown__action-button">
                ${showIcon()}
                Actions
              </button>            
            </div>
            <div class="dropdown__content-wrapper">
              <div class="dropdown__content">
                <button class="button button_primary" onclick="${dispatchShowEditBrandForm({brandId: brand.id})}">
                  ${editIcon()}
                  Edit
                </button>
                <button class="button button_secondary" onclick="${dispatchShowGetFakeModels({brandId: brand.id})}">
                  ${downloadIcon()}
                  Fake models
                </button>
                <button class="button button_danger" onclick="${dispatchRemoveAllModels({brandId: brand.id})}">
                  ${removeIcon()}
                  Remove all
                </button>
                <button class="button button_danger" onclick="${dispatchRemoveBrand({brandId: brand.id})}">
                  ${removeIcon()}
                  Remove brand
                </button>
              </div>
            </div>
          </div>
          <button class="button button_secondary toolbar__hide-button" id="minimize-button">
            ${document.querySelector(".create-form")?.offsetHeight > 0 || brand.models.length === 0
      ? 'Hide ' + hideIcon() : 'Show ' + showIcon()}
          </button>
        </div>
        <form class="models__create-form create-form" style="height: ${brand.models.length === 0 ? 'auto' : 0}">
          <label class="create-form__form-label form-label">
            <span class="create-form__form-label-text">Add new model</span>
            <input class="input" type="text" placeholder="Add model title" name="title" ${validation('title')}>
          </label>
          <label class="create-form__form-label form-label">
            <span class="create-form__form-label-text">Add description</span>
            <input class="input" type="text" placeholder="Add description" name="description" ${validation('description')}>
          </label>
          <button class="button button_primary create-form__add-button" type="submit">Add</button>
        </form>
      </div>
      <div class="model-filter">
        <label class="model-filter__label">
          <span class="model-filter__label-text">Filter by status</span>
          <select class="input" id="model-filter" name="reserved" onchange="window.dispatch?.call(null, 'filter-models', {brandId: ${brand.id}, reserved: this.value})">
            <option value="all" selected>All</option>
            <option value="true">Reserved</option>
            <option value="false">Available</option>
          </select>
        </label>
      </div>
      <div class="models__list list">
        ${brand.models.length === 0
      ? /*html*/`<h5 class="no-entries">No entries yet. Add new one using the form above.</h5>`
      : getModelsTemplate(brand)
  }
      </div>
    </div>
    `
  page.querySelector('.create-form')?.addEventListener("submit", handleAddModel);
  Maybe.of(page.querySelector('.list')).do(observeList)
  return page;
}

/**
 * 
 * @param {Brand} brand
 * @returns 
 */
export function getModelsTemplate(brand) {
  const { models } = brand;
  return models.map(model => {
    return /*html*/`
      <div class="list__item card model" data-id="${model.id}">
        <div class="card__card-header card-header model-header ${model.reserved ? 'model-header_reserved' : ''}" 
          onclick="${dispatchToggleModel({brandId: brand.id, modelId: model.id})}">
          <h3 class="card-title card__card-title model__title ${model.reserved ? 'model-title_reserved' : ''}">
            ${model.title}
          </h3>
          <h5 class="model__status status">
            Status:     
            <span class="status__text">
              ${model.reserved ? `${doneIcon()} Reserved` : `${progressIcon()} Available`}
            </span>        
          </h5>
          <div class="card__description description">${model.description}</div>
        </div>
        <div class="card__toolbar toolbar">
          <button class="button button_primary" onclick="${dispatchShowEditModelForm({
        brandId: brand.id,
        modelId: model.id
    })}">
            ${editIcon()}
            Edit
          </button>
          <button class="button button_danger" onclick="${dispatchRemoveModel({brandId: brand.id, modelId: model.id})}">
            ${removeIcon()}
            Remove
          </button>
        </div>
      </div>
    `;
  }).join("");
}

/**
 * 
 * @param {Model} model
 * @returns 
 */
export function renderEditModelForm(model) {
  const page = fragment/*html*/`
    <h1 class="title container__title">Edit model</h1>
    <form class="edit-form model-edit-form" data-brand-id=${model.brandId} data-model-id=${model.id}>
      <label class="edit-form__form-label form-label">
        <span class="edit-form__form-label-text">Edit model title</span>
        <input class="input" type="text" placeholder="Edit model title" name="title" value="${model.title}" ${validation('title')}>
      </label>
      <label class="edit-form__form-label form-label">
        <span class="edit-form__form-label-text">Edit description</span>
        <input class="input" type="text" placeholder="Edit description" name="description" value="${model.description}" ${validation('description')}>
      </label>
      <label class="edit-form__form-label form-label">
        <span class="edit-form__form-label-text">Edit status</span>
        <select class="input" name="reserved">
          <option value="true" ${model.reserved ? 'selected' : ''}>Reserved</option>
          <option value="false" ${!model.reserved ? 'selected' : ''}>Available</option>
        </select>
      </label>
      <button class="button button_primary" onclick="history.back()">
        ${backIcon()}
        Back
      </button>
      <button class="button button_primary edit-form__edit-button" type="submit">
        ${editIcon()}
        Edit
      </button>
    </form>
  `;
  page.querySelector('.edit-form')?.addEventListener("submit", handleEditModel);
  return page;
}
/**
 * 
 * @param {Brand} brand
 * @returns 
 */
export function renderEditBrandForm(brand) {
  const page = fragment/*html*/`
    <h1 class="title container__title">Edit model</h1>
    <form class="edit-form model-edit-form" data-brand-id=${brand.id}>
      <label class="edit-form__form-label form-label">
        <span class="edit-form__form-label-text">Edit model title</span>
        <input class="input" type="text" placeholder="Edit model title" name="title" value="${brand.title}" ${validation('title')}>
      </label>
      <label class="edit-form__form-label form-label">
        <span class="edit-form__form-label-text">Edit description</span>
        <input class="input" type="text" placeholder="Edit description" name="description" value="${brand.description}" ${validation('description')}>
      </label>
      <button class="button button_primary" onclick="history.back()">
        ${backIcon()}
        Back
      </button>
      <button class="button button_primary edit-form__edit-button" type="submit">
        ${editIcon()}
        Edit
      </button>
    </form>
  `;
  page.querySelector('.edit-form')?.addEventListener("submit", handleEditBrand);
  return page;
}

/**
 * 
 * @param {string} content 
 */
export function renderModal(content) {
  return fragment/*html*/`
    <div class="modal">
      <div class="modal__content">
        ${content}
      </div>
    </div>
  `
}

/**
 * 
 * @param {FakeUser[]} users
 * @param {number} groupId
 */
export function renderGetModelsForm(users, groupId) {
  return /*html*/`
    <h2 class="title container__title">Select user for import</h2>
    <form class="edit-form model-edit-form" data-group-id=${groupId}>
      <label class="edit-form__form-label form-label">
        <span class="edit-form__form-label-text">Select user for import</span>
        <select class="input" name="userId">
          ${users.map(user => {
      return `<option value="${user.id}" ${user.id === 1 ? 'selected' : ''}>${user.name}</option>`
  })}
        </select>
      </label>
      <button class="button button_secondary edit-form__edit-button" type="submit">
        ${downloadIcon()}
        Import
      </button>
    </form>
  `;
}

function validation(name) {
  return `
    required 
    oninvalid="this.setCustomValidity('Please enter a valid ${name}');this.parentElement.classList.add('input_error')"
    oninput="this.setCustomValidity('');this.parentElement.classList.remove('input_error')"
  `;
}