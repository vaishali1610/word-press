class Editor {
  constructor(editorId) {
    this.editor = document.getElementById(editorId);
    this.wordCount = document.querySelector(".word-count strong");
    this.initToolbar();
    this.updateWordCount();
    this.titleInput = document.getElementById("title");
    this.authorInput = document.getElementById("author");
    this.pageTitle = document.getElementById("page-title");
    this.pageAuthor = document.getElementById("page-author");

    this.titleInput.addEventListener("input", () => {
      this.pageTitle.innerText = this.titleInput.value || "Assignment: Write your title";
    });
    this.authorInput.addEventListener("input", () => {
      this.pageAuthor.innerText = this.authorInput.value || "Author";
    });
    this.editor.addEventListener("input", () => this.updateWordCount());
    this.editor.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        e.preventDefault(); 
        document.execCommand("insertHTML", false, "<br><br>"); 
      }
    });
    this.imageInput = document.createElement("input");
    this.imageInput.type = "file";
    this.imageInput.accept = "image/*";
    this.imageInput.style.display = "none";
    document.body.appendChild(this.imageInput);
    this.imageInput.addEventListener("change", (e) => this.insertImage(e.target.files[0]));

    this.selectedImage = null;

    this.editor.addEventListener("click", (e) => {
      if (e.target.tagName === "IMG") this.selectImage(e.target);
      else if (this.selectedImage) this.deselectImage();
      if (e.target.tagName === "A") {
        e.preventDefault();
        const url = e.target.getAttribute("href");
        if (url) window.open(url, "_blank");
      }
    });
  }

  execCommand(command, value = null) {
    this.editor.focus();
    document.execCommand(command, false, value);
  }

  updateWordCount() {
    const text = this.editor.innerText || "";
    const words = text.trim().split(/\s+/).filter(Boolean);
    this.wordCount.innerText = words.length;
  }

  initToolbar() {
    document.querySelector("[data-action='toggle-dark']").addEventListener("click", () => {
    document.body.classList.toggle("light-mode");
});
document.querySelector("[data-action='find']").addEventListener("click", () => {
    const findText = prompt("Enter text to find:");
    if (!findText) return;
    const replaceText = prompt(`Replace "${findText}" with:`);
    const regex = new RegExp(findText, "g");
    this.editor.innerHTML = this.editor.innerHTML.replace(regex, replaceText);
});
    document.querySelectorAll(".tool").forEach(btn => {
      btn.addEventListener("click", () => {
        const action = btn.dataset.action;
        switch(action) {
          case "bold": this.execCommand("bold"); break;
          case "italic": this.execCommand("italic"); break;
          case "underline": this.execCommand("underline"); break;
          case "align-left": this.execCommand("justifyLeft"); break;
          case "align-center": this.execCommand("justifyCenter"); break;
          case "align-right": this.execCommand("justifyRight"); break;
          case "olist": this.execCommand("insertOrderedList"); break;
          case "ulist": this.execCommand("insertUnorderedList"); break;
          case "image": this.imageInput.click(); break;
          case "link": this.addLink(); break;
          case "clear-format": this.clearSelectedFormatting(); break;
          case "reset-editor":this.editor.innerHTML = "<p></p>"; 
    this.titleInput.value = "";
    this.authorInput.value = "";
    this.pageTitle.innerText = "Assignment: Write your title";
    this.pageAuthor.innerText = "Author";
    this.updateWordCount();
        }
      });
    });

    document.querySelector("[data-action='fontSize']").addEventListener("change", e => {
      const px = parseInt(e.target.value); 
      const size = pxToFontSizeValue(px);  
      document.execCommand("fontSize", false, size);
    });
    document.querySelector("[data-action='heading']").addEventListener("change", e => {
      const tag = e.target.value;
      this.execCommand("formatBlock", tag);
    });
    const fontSelect = document.getElementById("font");
fontSelect.addEventListener("change", () => {
    const fontName = fontSelect.value;
    const editor = document.getElementById("editor");
    editor.style.fontFamily = fontName; 
});
    const textColorInput = document.createElement("input");
    textColorInput.type = "color";
    textColorInput.title = "Text Color";
    textColorInput.addEventListener("input", e => {
      this.execCommand("foreColor", e.target.value);
    });
    document.querySelector(".toolbar .group:first-child").appendChild(textColorInput);

    const highlightInput = document.createElement("input");
    highlightInput.type = "color";
    highlightInput.title = "Highlight";
    highlightInput.addEventListener("input", e => {
      this.execCommand("hiliteColor", e.target.value);
    });
    document.querySelector(".toolbar .group:first-child").appendChild(highlightInput);

    document.querySelector("[data-action='export-pdf']").addEventListener("click", () => {
      const content = document.querySelector(".page");
      const opt = {
        margin: 5,
        filename: 'document.pdf',
        image: { type: 'jpeg', quality: 1 },
        html2canvas: { scale: 3, letterRendering: true, useCORS: true, logging: false },
        jsPDF: { unit: 'pt', format: 'a4', orientation: 'portrait' }
      };
      html2pdf().set(opt).from(content).save();
    });
  }
clearSelectedFormatting() {
  const selection = window.getSelection();
  if (!selection.rangeCount) return;

  if (!selection.isCollapsed) {
    document.execCommand("removeFormat", false, null);
    document.execCommand("unlink", false, null);
    document.execCommand("formatBlock", false, "p");
  } else {
    const text = this.editor.innerText; 
    this.editor.innerHTML = "";
    const p = document.createElement("p");
    p.textContent = text;
    this.editor.appendChild(p);
  }
}

  insertImage(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = document.createElement("img");
      img.src = event.target.result;
      img.style.maxWidth = "100%";
      img.style.margin = "10px 0";
      img.style.cursor = "pointer";
      img.draggable = false;

      const sel = window.getSelection();
      if (!sel.rangeCount) this.editor.appendChild(img);
      else {
        const range = sel.getRangeAt(0);
        range.deleteContents();
        range.insertNode(img);
        range.setStartAfter(img);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
      }
    };
    reader.readAsDataURL(file);
    this.imageInput.value = "";
  }

  selectImage(img) {
    if (this.selectedImage) this.deselectImage();
    this.selectedImage = img;
    img.style.border = "2px dashed #ff61e7";
  }

  deselectImage() {
    if (!this.selectedImage) return;
    this.selectedImage.style.border = "none";
    this.selectedImage = null;
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
    this.editor.appendChild(table);
  }
  copyPlainText() {
    const text = this.editor.innerText;
    navigator.clipboard.writeText(text).then(() => {
      alert("Copied as plain text!");
    });
  }
  copyHTML() {
    const html = this.editor.innerHTML;
    navigator.clipboard.writeText(html).then(() => {
      alert("Copied as HTML!");
    });
  }

  addLink() {
    const selection = window.getSelection();
    if (selection.isCollapsed) {
      alert("Please select the text you want to link.");
      return;
    }
    const url = prompt("Enter the URL for the link:", "https://");
    if (url) {
      this.execCommand("createLink", url);
    }
  }
}

function pxToFontSizeValue(px) {
  const map = { 1: 10, 2: 13, 3: 16, 4: 18, 5: 24, 6: 32, 7: 48 };
  let closest = 1;
  let minDiff = Infinity; 
  for (let key in map) {
    let diff = Math.abs(px - map[key]);
    if (diff < minDiff) {
      minDiff = diff;
      closest = key;
    }
  }
  return closest;
}

document.addEventListener("DOMContentLoaded", () => {
  const editor = new Editor("editor");
});
