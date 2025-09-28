class Editor {
  constructor(editorId) {
    this.editor = document.getElementById(editorId);
    this.wordCount = document.querySelector(".word-count strong");
    this.initToolbar();
    this.updateWordCount();
    this.editor.addEventListener("input", () => this.updateWordCount());
     this.editor.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        e.preventDefault(); 
        document.execCommand("insertHTML", false, "<br><br>"); 
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
        }
      });
    });

document.querySelector("[data-action='fontSize']").addEventListener("change", e => {
  const px = parseInt(e.target.value); 
  const size = pxToFontSizeValue(px);  
  document.execCommand("fontSize", false, size);
});
document.querySelector("[data-action='heading']").addEventListener("change", e => {
      const tag = e.target.value; // e.g., h1, h2, p
      this.execCommand("formatBlock", tag);
    });

 document.querySelector("[data-meta='font']").addEventListener("change", e => {
      const font = e.target.value;
      this.execCommand("fontName", font);
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
  const content = document.querySelector(".page"); // the editor content
  const opt = {
    margin:       5,
    filename:     'document.pdf',
    image:        { type: 'jpeg', quality: 1 },
    html2canvas:  { scale: 3, letterRendering: true, useCORS: true, logging: false },
    jsPDF:        { unit: 'pt', format: 'a4', orientation: 'portrait' }
  };
  html2pdf().set(opt).from(content).save();
});
  }
}

function pxToFontSizeValue(px) {
  const map = { 1: 10, 2: 13, 3: 16, 4: 18, 5: 24, 6: 32, 7: 48
  };
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