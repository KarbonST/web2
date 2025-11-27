// @ts-check

import { Maybe } from './helpers.js';

export function getCarBrandById(id) {
  const brands = getCarBrands();
  return brands.find(brand => brand.id === Number(id));
}

/** @type {ModelGroups | null} */
let modelBrandsStore = null

/**
 * 
 * @returns {Brand[]}
 */
export function getCarBrands() {
  const baseModelBrands = [
    {
      id: 1,
      title: "Kia",
      description: "This is a car brand represented in South Korea.",
      models: [
        {
          id: 1,
          title: "Rio",
          description: "This is a most salable model of this brand",
          reserved: false,
          brandId: 1
        },
        {
          id: 2,
          title: "Cerato",
          description: "",
          reserved: true,
          brandId: 1
        },
      ]
    }
  ];
  if (modelBrandsStore) return modelBrandsStore;
  const modelsFromStorage = localStorage.getItem("models");
  if (modelsFromStorage) {
    try {
      // @ts-ignore
      modelBrandsStore = JSON.parse(modelsFromStorage);
      // @ts-ignore
      return modelBrandsStore;
    } catch (e) {
      localStorage.removeItem("models");
    }
  }
  return baseModelBrands;
}

/**
 * 
 * @param {GetBrandParams} params
 * @returns 
 */
export function getBrand({ id, models = null }) {
  return Maybe.of(models ?? getCarBrands())
    .bind(models => models.find(brand => brand.id === Number(id)))
    .get();
}

/**
 * 
 * @param {GetModelParams} params
 * @returns 
 */
export function getModel({ brandId = null, modelId, brand = null }) {
  if (brandId) return Maybe.of(brand ?? getBrand({ id: brandId }))
    .bind(brand => brand.models.find(model => model.id === Number(modelId)))
    .get();
  return Maybe.of(getCarBrands())
    .bind(brands => {
      for (const brand of brands) {
        for (const model of brand.models) {
          if (model.id === modelId) return model
        }
      }
    })
    .get()
}

/**
 * 
 * @param {GetDataParams} params
 * @returns 
 */
export function getData({ brandId, modelId = null }) {
  const modelGroups = getCarBrands();
  const brand = getBrand({ id: brandId, models: modelGroups });
  if (modelId === null) return { models: modelGroups, group: brand };
  const model = getModel({
    brandId: brandId,
    modelId: modelId,
    brand: brand,
  });
  return { models: modelGroups, group: brand, todo: model };
}

/**
 * 
 * @param {ModelGroups?} modelGroups
 */
export function saveModels(modelGroups = null) {
  modelGroups ??= getCarBrands();
  // modelGroups.forEach(group => {
  //   if (group.todos.length === 0) window.dispatch(events.groupHasNoTodos, { groupId: group.id });
  // })
  modelBrandsStore = modelGroups;
  localStorage.setItem("models", JSON.stringify(modelGroups));
}

/**
 * @param {number} id 
 */
export async function getFakeModelsForUser(id) {
  try {
    const response = await fetch(`https://jsonplaceholder.typicode.com/users/${id}/todos`);
    /** @type {ServerModel[]} */
    const models = await response.json();
    return models.map(model => {
      return {
        id: model.id,
        title: model.title,
        description: model.completed ? 'Reserved' : 'Available',
        reserved: model.completed,
      };
    });
  } catch (err) {
    console.error(err);
    return [];
  }
}

/**
 * 
 * @returns {Promise<FakeUser[] | null>}
 */
export async function getFakeUsers() {
  try {
    const response = await fetch(`https://jsonplaceholder.typicode.com/users`);
    if (!response.ok) throw new Error('Error fetching users');
    /** @type {User[]} */
    const users = await response.json();
    return users.map(user => {
      return {
        id: user.id,
        name: user.name,
      };
    });
  } catch (err) {
    console.error(err);
    return null;
  }
}