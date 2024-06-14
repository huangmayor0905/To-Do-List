let listState = [];

const STATE_KEY = "todo-list";

function loadState() {
  const listState = localStorage.getItem(STATE_KEY);
  if (listState !== null) {
    return JSON.parse(listState);
  }
  return [];
}

function svaeState(list) {
  localStorage.setItem(STATE_KEY, JSON.stringify(list));
}

function initList() {
  // load state
  listState = loadState();
  // render list
  const ul = document.getElementById("list");
  for (const item of listState) {
    const li = document.createElement("li");
    li.draggable = true;
    li.innerText = item.text;

    const deleteButton = document.createElement("span");
    deleteButton.classList.add("delete");
    deleteButton.onclick = deleteItem;
    li.appendChild(deleteButton);

    li.classList.add("item");
    if (item.checked) {
      li.classList.add("checked");
    }
    li.onclick = checkItem;
    ul.appendChild(li);
  }
}

function addItem() {
  const ul = document.getElementById("list");
  const input = document.getElementById("input");
  const text = input.value;
  if (text === "") {
    return;
  }

  const newItem = document.createElement("li");
  newItem.classList.add("item");
  newItem.draggable = true;
  newItem.innerText = text;

  newItem.onclick = checkItem;

  const deleteButton = document.createElement("span");
  deleteButton.classList.add("delete");
  deleteButton.onclick = deleteItem;

  newItem.appendChild(deleteButton);

  listState.push({
    text: text,
    checked: false
  });
  svaeState(listState);

  input.value = "";
  ul.appendChild(newItem);
}

function checkItem() {
  const item = this;
  const parent = item.parentNode;
  const idx = Array.from(parent.childNodes).indexOf(item);

  listState[idx].checked = !listState[idx].checked;

  item.classList.toggle("checked");
  svaeState(listState);
}

function deleteItem(e) {
  const item = this.parentNode;
  const parent = item.parentNode;
  const idx = Array.from(parent.childNodes).indexOf(item);

  listState = listState.filter((_, i) => i !== idx);

  parent.removeChild(item);
  svaeState(listState);
  e.stopPropagation();
}

initList();

const addButton = document.getElementById("add-button");
addButton.addEventListener("click", addItem);

const form = document.getElementById("input-wrapper");
form.addEventListener("submit", e => {
  e.preventDefault();
});

// drag drop listener
function makeSortable(list) {
  let draggedItem = null;
  let autoScrollInterval = null;

  list.addEventListener("dragstart", event => {
    draggedItem = event.target;
    event.target.classList.add("dragging");
  });

  list.addEventListener("dragend", event => {
    event.target.classList.remove("dragging");
    draggedItem = null;
    svaeState(list);
  });

  list.addEventListener("dragover", event => {
    event.preventDefault();
    const draggingOverItem = event.target;
    if (
      draggingOverItem.nodeName === "LI" &&
      draggingOverItem !== draggedItem
    ) {
      const bounding = draggingOverItem.getBoundingClientRect();
      const offset = bounding.y + bounding.height / 2;
      if (event.clientY - offset > 0) {
        list.insertBefore(draggedItem, draggingOverItem.nextSibling);
      } else {
        list.insertBefore(draggedItem, draggingOverItem);
      }
    }

    // Auto-scroll functionality
    const viewportHeight = window.innerHeight;
    const scrollSpeed = 20; // Adjust scrolling speed as needed

    if (event.clientY < 100) {
      // Scroll up
      clearInterval(autoScrollInterval);
      autoScrollInterval = setInterval(() => {
        window.scrollBy(0, -scrollSpeed);
      }, 50);
    } else if (event.clientY > viewportHeight - 100) {
      // Scroll down
      clearInterval(autoScrollInterval);
      autoScrollInterval = setInterval(() => {
        window.scrollBy(0, scrollSpeed);
      }, 50);
    } else {
      clearInterval(autoScrollInterval);
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const sortableList = document.getElementById("list");
  makeSortable(sortableList);
});
