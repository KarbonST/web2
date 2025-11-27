// @ts-check
/// <reference path="./types.d.ts" />

import { partial, toJson } from './helpers.js';

export function initDispatchEvent() {
  /**
   * 
   * @param {string} eventName 
   * @param {Record<string, any>} [detail] 
   */
  function dispatchEvent(eventName, detail = {}) {
    const event = new CustomEvent(eventName, { detail });
    document.dispatchEvent(event);
  }
  window.dispatch = dispatchEvent;
}

export function on(eventName, callback) {
  document.addEventListener(eventName, (event) => {
    callback(event.detail);
  });
}

export const events = {
  toggleModel: "toggle-model",
  removeModel: "remove-model",
  removeBrand: "remove-brand",
  removeAllBrands: "remove-all-brands",
  removeAllModels: "remove-all-models",
  showGetFakeModels: "show-get-fake-models",
  showEditModelForm: "show-edit-model-form",
  showEditBrandForm: "show-edit-brand-form",
  brandHasNoModels: "brand-has-no-models",
  filterModels: "filter-models",
};

/**
 * @param {string} eventName
 * @param {any} details
 */
export function baseDispatch(eventName, details) {
  return `window.dispatch?.call(null, '${eventName}', ${toJson(details)})`
}

/** @type {(details: ToggleCarParams) => void} */
export const dispatchToggleModel = partial(baseDispatch, events.toggleModel);

/** @type {(details: RemoveCarParams) => void} */
export const dispatchRemoveModel = partial(baseDispatch, events.removeModel);

/** @type {(details: RemoveBrandParams) => void} */
export const dispatchRemoveBrand = partial(baseDispatch, events.removeBrand);

export const dispatchRemoveAllBrands = partial(baseDispatch, events.removeAllBrands);

/** @type {(details: RemoveAllModelsParams) => void} */
export const dispatchRemoveAllModels = partial(baseDispatch, events.removeAllModels);

/** @type {(details: ShowGetFakeModelsParams) => void} */
export const dispatchShowGetFakeModels = partial(baseDispatch, events.showGetFakeModels);

/** @type {(details: ShowEditModelFormParams) => void} */
export const dispatchShowEditModelForm = partial(baseDispatch, events.showEditModelForm);

/** @type {(details: ShowEditBrandFormParams) => void} */
export const dispatchShowEditBrandForm = partial(baseDispatch, events.showEditBrandForm);
