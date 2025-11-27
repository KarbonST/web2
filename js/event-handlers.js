// @ts-check
/// <reference path="./types.d.ts" />

import { getFakeUsers, getGroup, getTodo, getCarBrands, saveTodos } from './data.js';
import { events, initDispatchEvent, on } from './events.js';
import { handleGetFakeTodos } from './form-handlers.js';
import { Maybe, compose, getFullHeightOfChildren, initModalCloseHandler, removeAnimatedModal } from './helpers.js';
import { doneIcon, hideIcon, progressIcon, showIcon } from './icons.js';
import { getTodosTemplate, renderGetTodosForm, renderModal } from './renders.js';

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
function handleShowEditGroupForm({ brandId }) {
  // history.pushState(null, '', `#/todos/edit?groupId=${groupId}&todoId=${todoId}`);
  window.location.hash = `#/todos/${brandId}/edit`;
}

/**
 * 
 * @param {ShowEditModelFormParams} params
 */
function handleShowEditTodoForm({ brandId, modelId }) {
  // history.pushState(null, '', `#/todos/edit?groupId=${groupId}&todoId=${todoId}`);
  window.location.hash = `#/todos/${brandId}/${modelId}/edit`;
}

/**
 * 
 * @param {ToggleCarParams} details
 * @returns 
 */
function handleToggleTodo({ brandId, modelId }) {
  const todo = getTodo({ brandId: brandId, modelId: modelId });
  if (!todo) return;
  todo.done = !todo.done;
  saveTodos();
  Maybe.of(document.querySelector(`.todo[data-id="${modelId}"]`))
    .bind(todoElement => todoElement.querySelector(".todo__title"))
    .do(subtitle => subtitle.classList.toggle("todo-title_done"))
    .bind(() => document.querySelector(`.todo[data-id="${modelId}"] .status__text`))
    .do(status => status.innerHTML = todo.done ? `${doneIcon()} Done` : `${progressIcon()} In progress`)
    .bind(() => document.querySelector(`#todo-filter`))
    .bind(filter => filter instanceof HTMLSelectElement ? filter.value : null)
    .do(filter => {
      if (filter === 'all') return;
      const todoElement = document.querySelector(`.todo[data-id="${modelId}"]`);
      if (!todoElement) return;
      if (filter === 'true' && !todo.done) todoElement.remove();
      else if (filter === 'false' && todo.done) todoElement.remove();
    })
}

/**
 * 
 * @param {RemoveCarParams} details
 */
function handleRemoveTodo({ brandId, modelId }) {
  if (!confirm("Are you sure?")) return;
  Maybe.of(getGroup({ id: brandId }))
    .do(group => group.todos = group.todos.filter(todo => todo.id !== Number(modelId)))
    .do(() => saveTodos())
    .bind(() => document.querySelector(`.todo[data-id="${modelId}"]`))
    .do(todoElement => todoElement.remove());
}

/**
 * 
 * @param {RemoveBrandParams} details
 */
function handleRemoveGroup({ brandId }) {
  if (!confirm("Are you sure?")) return;
  Maybe.of(getCarBrands())
    .bind(groups => groups.filter(group => group.id !== Number(brandId)))
    .do(groups => saveTodos(groups))
    .bind(() => document.querySelector(`.group[data-id="${brandId}"]`))
    .do(groupElement => groupElement.remove())
    .catch(() => window.location.hash = "");
}

function handleRemoveAllGroups() {
  if (!confirm("Are you sure?")) return;
  saveTodos([]);
  Maybe.of(document.querySelector(".groups__list"))
    .do(groupList => groupList.innerHTML = "");
}

/**
 * 
 * @param {RemoveAllModelsParams} details
 */
function handleRemoveAllTodos({ brandId }) {
  if (!confirm("Are you sure?")) return;
  Maybe.of(getGroup({ id: brandId }))
    .do(group => group.todos = [])
    .do(() => saveTodos())
    .bind(() => document.querySelector(".todos__list"))
    .do(todoList => todoList.innerHTML = "");
}

/**
 * 
 * @param {ShowGetFakeModelsParams} details
 */
async function handleShowGetFakeTodos({ brandId }) {
  Maybe.of(await getFakeUsers())
    .bind(users => renderModal(renderGetTodosForm(users, brandId)))
    .bind(modal => modal.querySelector(".modal"))
    .do(modal => {
      modal.classList.add("modal_enter");
      document.body.append(modal);
      initModalCloseHandler(modal);
      const form = modal.querySelector("form");
      if (!form) return null;
      form.addEventListener("submit", (e) =>
        handleGetFakeTodos(e, () => removeAnimatedModal(modal)))
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
function handleFilterTodos({ brandId, reserved }) {
  const group = getGroup({ id: brandId });
  if (!group) return;
  const todoList = document.querySelector(".todos__list");
  if (!todoList) return;
  todoList.innerHTML = getTodosTemplate({
    ...group,
    models: group.todos.filter(todo => reserved === 'all' || String(todo.done) === reserved),
  });
}


export function initCustomEvents() {
  initDispatchEvent();
  on(events.toggleTodo, handleToggleTodo);
  on(events.removeTodo, handleRemoveTodo);
  on(events.removeGroup, handleRemoveGroup);
  on(events.removeAllGroups, handleRemoveAllGroups);
  on(events.removeAllTodos, handleRemoveAllTodos);
  on(events.showGetFakeTodos, handleShowGetFakeTodos);
  on(events.showEditGroupForm, handleShowEditGroupForm);
  on(events.showEditTodoForm, handleShowEditTodoForm);
  on(events.filterTodos, handleFilterTodos);
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