// @ts-check
/// <reference path="./types.d.ts" />

import { getBrand, getModel, getCarBrandById } from './data.js';
import { handleClick, initCustomEvents } from './event-handlers.js';
import { Maybe, fixHeightForm } from './helpers.js';
import { renderBrands, renderModels, renderNotFound, renderEditModelForm, renderEditBrandForm } from './renders.js';
import {initTheme} from "./theme.js";

const stylesLink = document.createElement("link");
stylesLink.rel = "stylesheet";
stylesLink.href = "css/index.css";
document.head.append(stylesLink);

document.addEventListener("DOMContentLoaded", start);

function start() {
  const root = document.getElementById("root");
  if (!root) return;
  root.innerHTML = /*html*/`
    <div class="container">
      <div class="content"></div>
    </div>` 
  const container = document.querySelector(".content");
  if (!container) return;
  container.replaceChildren(router());
  root.addEventListener("click", handleClick);
  initTheme()
  initCustomEvents()
  fixHeightForm()
}

window.addEventListener("hashchange", () => {
  const container = document.querySelector(".content");
  if (!container) return;
  container.replaceChildren(router());
  fixHeightForm()
});

function router() {
  const hash = window.location.hash;
  switch (true) {
    case hash === "":
      return renderBrands();
    case /^#\/models\/\d+\/edit/.test(hash):
      return Maybe.of(hash.match(/^#\/models\/(\d+)\/edit/))
        .bind(([, brandId]) => getBrand({
          id: Number(brandId)
        }))
        .bind(brand => renderEditBrandForm(brand))
        .catch(() => renderNotFound())
        .get();
    case /^#\/models\/\d+\/\d+\/edit/.test(hash):
      return Maybe.of(hash.match(/^#\/models\/(\d+)\/(\d+)\/edit/))
        .bind(([, brandId, modelId]) => getModel({
          brandId: Number(brandId),
          modelId: Number(modelId),
        }))
        .bind(model => renderEditModelForm(model))
        .catch(() => renderNotFound())
        .get();
    case hash.startsWith("#/models/"):
      const id = hash.split("/")[2];
      const brand = getCarBrandById(id);
      if (brand) return renderModels(brand);
      return renderNotFound();
    default:
      return renderNotFound();
  }
}