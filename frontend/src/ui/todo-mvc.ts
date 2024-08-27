import { BaseHTMLElement, customElement, first, getChild, getChildren, html, OnEvent, onEvent, onHub } from "dom-native";
import { Todo, todoMco } from "src/model/todo-mco";

@customElement("todo-mvc")
class TodoMvc extends BaseHTMLElement {
    #todoInputEl!: TodoInput;
    #todoListEl!: HTMLElement;

    init(): void {
        let htmlContent: DocumentFragment = html`
        <div class="box"></div>
        <h1>todos</h1>
        <todo-input></todo-input>
        <todo-list></todo-list>
        `;
        [this.#todoInputEl, this.#todoListEl] = getChildren(htmlContent, 'todo-input', 'todo-list');

        this.append(htmlContent);
        this.refresh();
    }

    async refresh() {
        let todos: Todo[] = await todoMco.list();
        let htmlContent = document.createDocumentFragment();
        for (const todo of todos) {
            const el = document.createElement('todo-item');
            el.data = todo;
            htmlContent.append(el);
        }

        this.#todoListEl.innerHTML = '';
        this.#todoListEl.append(htmlContent);
    }

    // Ui Events
    @onEvent('pointerup', 'c-check')
    onCheckTodo(evt: PointerEvent & OnEvent) {
        const todoItem = evt.selectTarget.closest("todo-item")!;
        const status = todoItem.data.status == 'Open' ? 'Close' : 'Open';
        // update to server
        todoMco.update(todoItem.data.id, {status});
    }

    // Data Events
    @onHub('dataHub', 'Todo', 'update')
    onTodoUpdate(data: Todo) {
        // find the todo in the UI
        const todoItem = first(`todo-item.Todo-${data.id}`) as TodoItem | undefined;
        // if found update it
        if (todoItem) {
            todoItem.data = data;
        }
    }

    @onHub('dataHub', 'Todo', 'create')
    onTodoCreate(data: Todo) {
        this.refresh();
    }
}

@customElement("todo-input")
class TodoInput extends BaseHTMLElement {
    #inputEl!: HTMLInputElement;

    init(): void {
        let htmlContent: DocumentFragment = html`
        <input type="text" placeholder="What needs to be done?">
        `;
        this.#inputEl = getChild(htmlContent, 'input');
        this.append(htmlContent);
    }

    // UI Events
    @onEvent('keyup', 'input')
    onInputKeyUp(evt: KeyboardEvent) {
        if (evt.key == "Enter") {
            // get value from UI
            const title = this.#inputEl.value;
            // send crate to server
            todoMco.create({title});
            // don't wait, reset value input
            this.#inputEl.value = '';
        }
    }
}
declare global {
    interface HTMLElementTagNameMap {
        'todo-input': TodoInput;
    }
}

@customElement("todo-item")
class TodoItem extends BaseHTMLElement {
    #titleEl!: HTMLElement;
    #data!: Todo;

    set data(data: Todo) {
        let oldData = this.#data;
        this.#data = Object.freeze(data);
        if (this.isConnected) {
            this.refresh(oldData);
        }
    }

    get data() { return this.#data }

    init(): void {
        let htmlContent: DocumentFragment = html`
        <c-check><c-ico name="ico-done"></c-ico></c-check>
        <div class="title">STATIC TITLE</div>
        <c-ico name="del"></c-ico>
        `;
        this.#titleEl = getChild(htmlContent, 'div');

        this.append(htmlContent);
        this.refresh();
    }

    refresh(old?: Todo) {
        if (old != null) {
            this.classList.remove(`Todo-${old.id}`);
            this.classList.remove(old.status);
        }
        // render new data
        const todo = this.#data;
        this.classList.add(`Todo-${todo.id}`);
        this.classList.add(todo.status);
        this.#titleEl.textContent = todo.title;
    }
}

// todo-input tag
declare global {
    interface HTMLElementTagNameMap {
        'todo-item': TodoItem;
    }
}
