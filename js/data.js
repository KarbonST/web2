// @ts-check

import { Maybe } from './helpers.js';

export function getCarBrandById(id) {
  const todos = getCarBrands();
  return todos.find(group => group.id === Number(id));
}

/** @type {ModelGroups | null} */
let todoGroupsStore = null

/**
 * 
 * @returns {Brand[]}
 */
export function getCarBrands() {
  const baseTodoGroups = [
    {
      id: 1,
      title: "Kia",
      description: "This is a car brand represented in South Korea.",
      todos: [
        {
          id: 1,
          title: "Todo 1 content 1",
          description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Accusantium, alias.",
          done: false,
          groupId: 1
        },
        {
          id: 2,
          title: "Todo 1 content 2",
          description: "",
          done: true,
          groupId: 1
        },
      ]
    }
  ];
  if (todoGroupsStore) return todoGroupsStore;
  const todosFromStorage = localStorage.getItem("todos");
  if (todosFromStorage) {
    try {
      // @ts-ignore
      todoGroupsStore = JSON.parse(todosFromStorage);
      // @ts-ignore
      return todoGroupsStore;
    } catch (e) {
      localStorage.removeItem("todos");
    }
  }
  return baseTodoGroups;
}

/**
 * 
 * @param {GetBrandParams} params
 * @returns 
 */
export function getGroup({ id, models = null }) {
  return Maybe.of(models ?? getCarBrands())
    .bind(todos => todos.find(group => group.id === Number(id)))
    .get();
}

/**
 * 
 * @param {GetModelParams} params
 * @returns 
 */
export function getTodo({ brandId = null, modelId, brand = null }) {
  if (brandId) return Maybe.of(brand ?? getGroup({ id: brandId }))
    .bind(group => group.todos.find(todo => todo.id === Number(modelId)))
    .get();
  return Maybe.of(getCarBrands())
    .bind(groups => {
      for (const group of groups) {
        for (const todo of group.todos) {
          if (todo.id === modelId) return todo
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
  const todos = getCarBrands();
  const group = getGroup({ id: brandId, models: todos });
  if (modelId === null) return { todos, group };
  const todo = getTodo({
    brandId: brandId,
    modelId: modelId,
    brand: group,
  });
  return { todos, group, todo };
}

/**
 * 
 * @param {ModelGroups?} todoGroups
 */
export function saveTodos(todoGroups = null) {
  todoGroups ??= getCarBrands();
  // todoGroups.forEach(group => {
  //   if (group.todos.length === 0) window.dispatch(events.groupHasNoTodos, { groupId: group.id });
  // })
  todoGroupsStore = todoGroups;
  localStorage.setItem("todos", JSON.stringify(todoGroups));
}

/**
 * @param {number} id 
 */
export async function getFakeTodosForUser(id) {
  try {
    const response = await fetch(`https://jsonplaceholder.typicode.com/users/${id}/todos`);
    /** @type {ServerModel[]} */
    const todos = await response.json();
    return todos.map(todo => {
      return {
        id: todo.id,
        title: todo.title,
        description: todo.completed ? 'Done' : 'In progress',
        done: todo.completed,
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