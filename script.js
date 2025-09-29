class Editor {
  constructor(editorId) {
    this.editor = document.getElementById(editorId);
    this.wordCount = document.querySelector(".word-count strong");
    this.titleInput = document.getElementById("title");
    this.authorInput = document.getElementById("author");
    this.pageTitle = document.getElementById("page-title");
    this.pageAuthor = document.getElementById("page-author");
    this.selectedImageWrapper = null;

    this.loadFromLocalStorage();
    this.setupEditor();
    this.initToolbar();
    this.updateWordCount();

    this.titleInput.addEventListener("input", () => {
      this.pageTitle.innerText = this.titleInput.value || "Assignment: Write your title";
      this.saveToLocalStorage();
    });
    this.authorInput.addEventListener("input", () => {
      this.pageAuthor.innerText = this.authorInput.value || "Author";
      this.saveToLocalStorage();
    });
  }

  setupEditor() {
    if (!this.editor.querySelector("p")) {
      const p = document.createElement("p");
      p.innerHTML = "<br>";
      this.editor.appendChild(p);
    }

    this.editor.addEventListener("input", () => this.updateWordCount());

    this.editor.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        const sel = window.getSelection();
        if (!sel.rangeCount) return;
        const range = sel.getRangeAt(0);

        const br1 = document.createElement("br");
        const br2 = document.createElement("br");
        range.deleteContents();
        range.insertNode(br1);
        range.insertNode(br2);
        range.setStartAfter(br2);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
      }
    });

    this.imageInput = document.createElement("input");
    this.imageInput.type = "file";
    this.imageInput.accept = "image/*";
    this.imageInput.style.display = "none";
    document.body.appendChild(this.imageInput);
    this.imageInput.addEventListener("change", (e) => this.insertImage(e.target.files[0]));

    this.editor.addEventListener("click", (e) => {
      if (e.target.matches(".delete-img-btn")) {
        const wrapper = e.target.closest(".image-wrapper");
        if (wrapper) {
          wrapper.remove();
          this.selectedImageWrapper = null;
          this.saveToLocalStorage();
        }
        return;
      }

      const wrapper = e.target.closest(".image-wrapper");
      if (wrapper) {
        this.selectImageWrapper(wrapper);
        return;
      }

      if (this.selectedImageWrapper) this.deselectImageWrapper();

      const a = e.target.closest("a");
      if (a) {
        e.preventDefault();
        const url = a.getAttribute("href");
        if (url) window.open(url, "_blank");
      }
    });
    document.addEventListener("keydown", (e) => {
      if ((e.key === "Delete" || e.key === "Backspace") && this.selectedImageWrapper) {
        e.preventDefault();
        this.selectedImageWrapper.remove();
        this.selectedImageWrapper = null;
        this.saveToLocalStorage();
      }
    });
  }

  execCommand(command, value = null) {
    this.editor.focus();
    document.execCommand(command, false, value);
    this.saveToLocalStorage();
  }

  updateWordCount() {
    const text = this.editor.innerText || "";
    const words = text.trim().split(/\s+/).filter(Boolean);
    this.wordCount.innerText = words.length;
  }

  saveToLocalStorage() {
    const data = {
      title: this.titleInput.value,
      author: this.authorInput.value,
      content: this.editor.innerHTML
    };
    localStorage.setItem("editorData", JSON.stringify(data));
  }

  loadFromLocalStorage() {
    const saved = localStorage.getItem("editorData");
    if (saved) {
      const data = JSON.parse(saved);
      if (data.title) {
        this.titleInput.value = data.title;
        this.pageTitle.innerText = data.title;
      }
      if (data.author) {
        this.authorInput.value = data.author;
        this.pageAuthor.innerText = data.author;
      }
      if (data.content) {
        this.editor.innerHTML = data.content;
      }
    }
  }

  initToolbar() {
    document.querySelectorAll(".tool").forEach((btn) => {
      btn.addEventListener("click", () => {
        const action = btn.dataset.action;
        switch (action) {
          case "bold":
          case "italic":
          case "underline":
          case "strikeThrough":
            this.execCommand(action);
            break;
          case "ulist":
            this.execCommand("insertUnorderedList");
            break;
          case "olist":
            this.execCommand("insertOrderedList");
            break;
          case "align-left":
            this.execCommand("justifyLeft");
            break;
          case "align-center":
            this.execCommand("justifyCenter");
            break;
          case "align-right":
            this.execCommand("justifyRight");
            break;
          case "indent":
            this.execCommand("indent");
            break;
          case "outdent":
            this.execCommand("outdent");
            break;
          case "image":
            this.imageInput.click();
            break;
          case "link":
            this.addLink();
            break;
          case "table":
            this.insertTable();
            break;
          case "copy-plain":
            this.copyPlainText();
            break;
          case "copy-html":
            this.copyHTML();
            break;
          case "clear-format":
            this.clearSelectedFormatting();
            break;
          case "reset-editor":
            this.editor.innerHTML = "<p><br></p>";
            this.titleInput.value = "";
            this.authorInput.value = "";
            this.pageTitle.innerText = "Assignment: Write your title";
            this.pageAuthor.innerText = "Author";
            this.updateWordCount();
            localStorage.removeItem("editorData");
            break;
        }
      });
    });
    document.querySelector("[data-action='preview']").addEventListener("click", () => {
      const modal = document.getElementById("preview-modal");
      const content = document.getElementById("preview-content");
      const title = this.titleInput.value || "Assignment: Write your title";
      const author = this.authorInput.value || "Author";
      content.innerHTML = `<h2>${title}</h2><p style="font-size:14px;color:#555;">By ${author}</p><hr>${this.editor.innerHTML}`;
      modal.style.display = "flex";
    });
    document.getElementById("close-preview").addEventListener("click", () => {
      document.getElementById("preview-modal").style.display = "none";
    });
    document.querySelector("[data-action='toggle-light']").addEventListener("click", () => {
      document.body.classList.toggle("light-mode");
    });

    document.querySelector("[data-action='find']").addEventListener("click", () => {
      const findText = prompt("Enter text to find:");
      if (!findText) return;
      const replaceText = prompt(`Replace "${findText}" with:`);
      const regex = new RegExp(findText, "g");
      this.editor.innerHTML = this.editor.innerHTML.replace(regex, replaceText);
      this.saveToLocalStorage();
    });

    document.querySelector("[data-action='fontSize']").addEventListener("change", e => {
      const px = parseInt(e.target.value);
      const size = pxToFontSizeValue(px);
      this.execCommand("fontSize", size);
    });
    document.querySelector("[data-action='heading']").addEventListener("change", e => {
      this.execCommand("formatBlock", e.target.value);
    });
    document.querySelector("[data-meta='font']").addEventListener("change", e => {
      this.execCommand("fontName", e.target.value);
    });

    const textColorInput = document.createElement("input");
    textColorInput.type = "color";
    textColorInput.addEventListener("input", e => this.execCommand("foreColor", e.target.value));
    document.querySelector(".toolbar .group:first-child").appendChild(textColorInput);

    const highlightInput = document.createElement("input");
    highlightInput.type = "color";
    highlightInput.addEventListener("input", e => this.execCommand("hiliteColor", e.target.value));
    document.querySelector(".toolbar .group:first-child").appendChild(highlightInput);

    document.querySelector("[data-action='export-pdf']").addEventListener("click", () => {
      const content = document.querySelector(".page");
      const opt = {
        margin: 5,
        filename: 'document.pdf',
        image: { type: 'jpeg', quality: 1 },
        html2canvas: { scale: 3, letterRendering: true, useCORS: true },
        jsPDF: { unit: 'pt', format: 'a4', orientation: 'portrait' }
      };
      html2pdf().set(opt).from(content).save();
    });
  }
  insertTable() {
    const rows = parseInt(prompt("Number of rows:", "2"));
    const cols = parseInt(prompt("Number of columns:", "2"));
    if (!rows || !cols) return;

    const table = document.createElement("table");
    table.style.borderCollapse = "collapse";
    table.style.width = "100%";

    for (let r = 0; r < rows; r++) {
      const tr = document.createElement("tr");
      for (let c = 0; c < cols; c++) {
        const td = document.createElement("td");
        td.textContent = " ";
        td.style.border = "1px solid black";
        td.style.padding = "5px";
        tr.appendChild(td);
      }
      table.appendChild(tr);
    }

    const sel = window.getSelection();
    if (!sel.rangeCount) this.editor.appendChild(table);
    else {
      const range = sel.getRangeAt(0);
      range.deleteContents();
      range.insertNode(table);
      range.setStartAfter(table);
      range.collapse(true);
      sel.removeAllRanges();
      sel.addRange(range);
    }
    this.saveToLocalStorage();
  }
  insertImage(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const wrapper = document.createElement("div");
      wrapper.className = "image-wrapper";
      wrapper.contentEditable = false;
      wrapper.style.display = "inline-block";
      wrapper.style.position = "relative";
      wrapper.style.resize = "both";
      wrapper.style.overflow = "auto";
      wrapper.style.width = "300px";
      wrapper.style.height = "auto";
      wrapper.style.border = "1px dashed #ccc";

      const img = document.createElement("img");
      img.src = event.target.result;
      img.style.width = "100%";
      img.style.height = "100%";
      img.style.display = "block";
      img.style.pointerEvents = "none";
      wrapper.appendChild(img);

      const delBtn = document.createElement("button");
      delBtn.innerText = "✖";
      delBtn.className = "delete-img-btn";
      delBtn.style.position = "absolute";
      delBtn.style.top = "2px";
      delBtn.style.right = "2px";
      delBtn.style.background = "red";
      delBtn.style.color = "white";
      delBtn.style.border = "none";
      delBtn.style.borderRadius = "50%";
      delBtn.style.cursor = "pointer";
      delBtn.style.zIndex = "10";
      delBtn.addEventListener("click", () => {
        wrapper.remove();
        this.selectedImageWrapper = null;
        this.saveToLocalStorage();
      });
      wrapper.appendChild(delBtn);

      const sel = window.getSelection();
      if (!sel.rangeCount) this.editor.appendChild(wrapper);
      else {
        const range = sel.getRangeAt(0);
        range.deleteContents();
        range.insertNode(wrapper);
        range.setStartAfter(wrapper);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
      }

      this.saveToLocalStorage();
    };
    reader.readAsDataURL(file);
    this.imageInput.value = "";
  }

  selectImageWrapper(wrapper) {
    if (this.selectedImageWrapper && this.selectedImageWrapper !== wrapper) {
      this.deselectImageWrapper();
    }
    this.selectedImageWrapper = wrapper;
    wrapper.classList.add("selected");
    const btn = wrapper.querySelector(".delete-img-btn");
    if (btn) btn.style.display = "block";
  }

  deselectImageWrapper() {
    if (!this.selectedImageWrapper) return;
    this.selectedImageWrapper.classList.remove("selected");
    const btn = this.selectedImageWrapper.querySelector(".delete-img-btn");
    if (btn) btn.style.display = "none";
    this.selectedImageWrapper = null;
  }

  addLink() {
    const sel = window.getSelection();
    if (sel.isCollapsed) return alert("Select text first!");
    const url = prompt("Enter URL", "https://");
    if (url) this.execCommand("createLink", url);
  }

  copyPlainText() {
    const text = this.editor.innerText;
    navigator.clipboard.writeText(text).then(() => alert("Copied as plain text!"));
  }

  copyHTML() {
    const html = this.editor.innerHTML;
    navigator.clipboard.writeText(html).then(() => alert("Copied as HTML!"));
  }

  clearSelectedFormatting() {
    document.execCommand("removeFormat", false, null);
    document.execCommand("unlink", false, null);
    this.saveToLocalStorage();
  }
}
function pxToFontSizeValue(px) {
  const map = { 1: 10, 2: 13, 3: 16, 4: 18, 5: 24, 6: 32, 7: 48 };
  let closest = 1;
  let minDiff = Infinity;
  for (let key in map) {
    let diff = Math.abs(px - map[key]);
    if (diff < minDiff) { minDiff = diff; closest = key; }
  }
  return closest;
}
document.addEventListener("DOMContentLoaded", () => {
  new Editor("editor");
});
