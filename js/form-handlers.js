// @ts-check
/// <reference path="./types.d.ts" />

import { getData, getFakeModelsForUser, getBrand, getModel, getCarBrands, saveModels } from './data.js';
import { Maybe, sanitize } from './helpers.js';
import { getBrandsTemplate, getModelsTemplate } from './renders.js';

/**
 * @param {Event} event 
 */
export function handleAddBrand(event) {
  const { values: { title, description } } = handleForm(event)
  if (title && description) {
    const brands = getCarBrands();
    const newBrand = {
      id: brands.length + 1,
      title,
      description,
      models: [],
    };
    brands.push(newBrand);
    saveModels(brands);
    const brandsList = document.querySelector(".brands__list");
    if (!brandsList) return;
    brandsList.insertAdjacentHTML("beforeend", getBrandsTemplate([newBrand]));
  }
}

/**
 * @param {Event} event 
 */
export function handleAddModel(event) {
  const { values: { title, description }, form } = handleForm(event)
  if (title && description) {
    const brandId = form.closest(".models")?.dataset?.brandId;
    const { models, brand } = getData({ brandId: brandId });
    if (!brand) return;
    const newModel = {
      id: brand.models.length + 1,
      title,
      description,
      reserved: false,
      brandId: brandId
    };
    brand.models.push(newModel);
    saveModels(models);
    // check model-filter
    const modelFilter = document.querySelector("#model-filter");
    if (modelFilter instanceof HTMLSelectElement && modelFilter.value === "true") return;
    const modelList = document.querySelector(".models__list");
    if (!modelList) return;
    modelList.insertAdjacentHTML("beforeend", getModelsTemplate({ ...brand, models: [newModel] }));
  }
}

/**
 * @param {Event} event 
 */
export function handleEditModel(event) {
  const { values: { title, description, reserved }, form } = handleForm(event)
  const brandId = Number(form.dataset.brandId)
  const modelId = Number(form.dataset.modelId)
  const model = getModel({ brandId: brandId, modelId: modelId });
  if (!model) return;
  model.title = title;
  model.description = description;
  model.reserved = reserved === 'true'
  saveModels();
  window.location.hash = `#/models/${brandId}`
}

/**
 * @param {Event} event 
 */
export function handleEditBrand(event) {
  const { values: { title, description }, form } = handleForm(event)
  const brandId = Number(form.dataset.brandId)
  const brand = getCarBrands().find(brand => brand.id === brandId);
  if (!brand) return;
  brand.title = title;
  brand.description = description;
  saveModels();
  window.location.hash = `#/models/${brandId}`
}

/**
 * @param {Event} event 
 * @param {Function?} callback
 */
export async function handleGetFakeModels(event, callback) {
  const { values: { userId }, form } = handleForm(event)
  const brandId = Number(form.dataset.brandId)
  Maybe.of(await getFakeModelsForUser(Number(userId)))
    .bind(models => models.map(model => ({ ...model, brandId: brandId })))
    .do(models => {
      const brand = getBrand({ id: brandId });
      if (!brand) return null;
      brand.models = brand.models.concat(models);
      saveModels();
      if (callback) callback();
      Maybe.of(document.querySelector("#model-filter"))
        .bind(filter => filter instanceof HTMLSelectElement ? filter.value : null)
        .bind(filter => models.filter(model => filter === 'all' || String(model.reserved) === filter))
        .do(models => {
          const modelsList = document.querySelector(".models__list");
          if (!modelsList) return null;
          modelsList.insertAdjacentHTML("beforeend", getModelsTemplate({ ...brand, models: models }));
        })
    })
}

/**
 * @param {Event} event 
 */
export function handleForm(event) {
  event.preventDefault();
  const form = event.target;
  if (!(form instanceof HTMLFormElement)) throw new Error("form is not an instance of HTMLFormElement");
  /** @type {{[key: string]: string}} */
  const values = {};
  /** @type {NodeListOf<HTMLInputElement | HTMLSelectElement>} */
  const inputs = form.querySelectorAll('input[name],select[name]');
  inputs.forEach(input => {
    values[input.name] = sanitize(input.value);
    input.value = "";
  });
  return { values, form };
}