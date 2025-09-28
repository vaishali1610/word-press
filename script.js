class Editor {
  constructor(editorId) {
    this.editor = document.getElementById(editorId);
    this.wordCount = document.querySelector(".word-count strong");
    this.initToolbar();
    this.updateWordCount();
    this.editor.addEventListener("input", () => this.updateWordCount());
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
