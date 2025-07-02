let traits = [];
let spawnerTraits = [];
let originalSpawners = [];
let player;
let selectedTrait = null;

let currentScene = 'intro'; // 'intro', 'tutorial', 'main', 'cook'

let tutorialBtnImg, howtoImg, homeBtnImg; 

let yearningImg, courageImg, attentiveImg;
let nestledImg, anchoringImg, defiantImg, empatheticImg, vulnerableImg;
let flipHImg, flipVImg;
let screenshotBtnImg, trashBtnImg, resetBtnImg, cookBtnImg, backBtnImg;
let popupImg, playBtnImg;
let bgImg, bgImg2;

// --- NEW: Variables for transformation animation ---
let boomGif;
let transformationSound;
let isTransforming = false;
let transformationStartTime;
const TRANSFORMATION_DURATION = 1500; // Duration in milliseconds (1.5 seconds)

// --- Button dimension variables ---
let flipHX, flipHY, flipVX, flipVY;
let trashX, trashY, trashW, trashH;
let resetBtnX, resetBtnY, resetBtnW, resetBtnH;
let cookBtnX, cookBtnY, cookBtnW, cookBtnH;
let backBtnX, backBtnY, backBtnW, backBtnH; // This is for the 'cook' scene
let screenshotBtnX, screenshotBtnY, screenshotBtnW, screenshotBtnH;
let playBtnX, playBtnY, playBtnW, playBtnH;
let tutorialBtnX, tutorialBtnY, tutorialBtnW, tutorialBtnH;
let homeBtnX, homeBtnY, homeBtnW, homeBtnH;

// --- NEW: Variables for the back button specifically in the 'main' scene ---
let mainBackBtnX, mainBackBtnY, mainBackBtnW, mainBackBtnH;

let resizing = false;
let rotating = false;
let takingScreenshot = false;

function preload() {
  yearningImg = loadImage('traits/yearning.png');
  courageImg = loadImage('traits/courage.png');
  attentiveImg = loadImage('traits/attentive.png');
  nestledImg = loadImage('traits/nestled.png');
  anchoringImg = loadImage('traits/anchoring.png');
  defiantImg = loadImage('traits/defiant.png');
  empatheticImg = loadImage('traits/empathetic.png');
  vulnerableImg = loadImage('traits/vulnerable.png');
  flipHImg = loadImage('buttons/flipH.png');
  flipVImg = loadImage('buttons/flipV.png');
  trashBtnImg = loadImage('buttons/trash.png');
  resetBtnImg = loadImage('buttons/reset.png');
  cookBtnImg = loadImage('buttons/cook.png');
  backBtnImg = loadImage('buttons/back.png');
  screenshotBtnImg = loadImage('buttons/screenshot.png');
  bgImg = loadImage('buttons/background.png');
  bgImg2 = loadImage('buttons/background2.png');
  popupImg = loadImage('buttons/popup.png');
  playBtnImg = loadImage('buttons/play.png');

  tutorialBtnImg = loadImage('buttons/tutorial.png');
  howtoImg = loadImage('buttons/howto.png');
  homeBtnImg = loadImage('buttons/home.png');
  
  boomGif = loadImage('buttons/boom.gif');
  soundFormats('mp3');
  transformationSound = loadSound('transformation.mp3');
}

function setup() {
  let w = windowWidth;
  let h = w * 9 / 16;
  if (h > windowHeight) {
    h = windowHeight;
    w = h * 16 / 9;
  }
  createCanvas(w, h);

  let baseButtonSize = width * 0.055;
  let largeButtonSize = width * 0.075;
  let edgeMargin = width * 0.03;
  let edgeMargin1 = width * 0.025;
  let largeButtonMargin = width * 0.005; 
  let baseButtonMargin = width * 0.000000000000001;
  let buttonGroupMargin = width * 0.06; 

  let spawnerTargetSize = width * 0.11; 
  let spawnedTraitScale = 0.2; 

  const w1 = 0.09 * w, w2 = 0.172185430 * w;
  const h1 = 0.353200 * h, h2 = 0.588668 * h;
  originalSpawners = [
    { img: yearningImg, x: w1, y: h1 }, { img: courageImg, x: w2, y: h1 },
    { img: attentiveImg, x: w - w2, y: h1 }, { img: nestledImg, x: w1, y: h2 },
    { img: anchoringImg, x: w2, y: h2 }, { img: defiantImg, x: w - w2, y: h2 },
    { img: empatheticImg, x: w - w1, y: h1 }, { img: vulnerableImg, x: w - w1, y: h2 }
  ].map(t => ({ ...t, targetWidth: spawnerTargetSize, spawnScale: spawnedTraitScale }));
  spawnerTraits = originalSpawners.map(s => new Trait(s.x, s.y, false, s.img, { targetWidth: s.targetWidth, spawnScale: s.spawnScale }));

  // --- Intro Scene Buttons ---
  playBtnW = width * 0.15; playBtnH = playBtnW / 2.5;
  playBtnX = width / 2.3 - playBtnW / 2.3;
  playBtnY = height * 0.72 - playBtnH / 2;
  tutorialBtnW = playBtnW; tutorialBtnH = playBtnH;
  tutorialBtnX = width / 1.8 - tutorialBtnW / 1.8;
  tutorialBtnY = height * 0.72 - playBtnH / 2;

  // --- Tutorial Scene Button ---
  homeBtnW = playBtnW; homeBtnH = playBtnH;
  homeBtnX = width / 2 - homeBtnW / 2;
  homeBtnY = height - homeBtnH - edgeMargin;

  // --- Main Scene Buttons (Bottom Right) ---
  cookBtnW = largeButtonSize; cookBtnH = largeButtonSize;
  cookBtnX = width - cookBtnW - edgeMargin1; cookBtnY = height - cookBtnH - edgeMargin1;
  resetBtnW = largeButtonSize; resetBtnH = largeButtonSize;
  resetBtnX = cookBtnX - resetBtnW - largeButtonMargin; resetBtnY = cookBtnY;
  trashW = largeButtonSize; trashH = largeButtonSize;
  trashX = resetBtnX - trashW - largeButtonMargin; trashY = cookBtnY;
  
  // --- Main Scene Buttons (Bottom Left) ---
  mainBackBtnW = baseButtonSize;
  mainBackBtnH = baseButtonSize;
  mainBackBtnX = edgeMargin;
  mainBackBtnY = height - mainBackBtnH - edgeMargin;
  flipHX = mainBackBtnX + mainBackBtnW + buttonGroupMargin;
  flipHY = mainBackBtnY;
  flipVX = flipHX + baseButtonSize + baseButtonMargin;
  flipVY = flipHY;

  // --- Cook Scene Buttons ---
  backBtnW = baseButtonSize; backBtnH = baseButtonSize;
  backBtnX = width - backBtnW - edgeMargin1;
  backBtnY = height - backBtnH - edgeMargin1;
  screenshotBtnW = baseButtonSize; screenshotBtnH = baseButtonSize;
  screenshotBtnX = backBtnX - screenshotBtnW - baseButtonMargin;
  screenshotBtnY = backBtnY;
}

function draw() {
  // This switch statement draws the current scene's background and elements
  switch (currentScene) {
    case 'intro':
      image(popupImg, 0, 0, width, height);
      drawButton(playBtnImg, playBtnX, playBtnY, playBtnW, playBtnH);
      drawButton(tutorialBtnImg, tutorialBtnX, tutorialBtnY, tutorialBtnW, tutorialBtnH);
      break;

    case 'tutorial':
      image(howtoImg, 0, 0, width, height);
      drawButton(playBtnImg, homeBtnX, homeBtnY, homeBtnW, homeBtnH);
      break;

    case 'main':
      image(bgImg, 0, 0, width, height);
      drawButton(trashBtnImg, trashX, trashY, trashW, trashH);
      drawButton(resetBtnImg, resetBtnX, resetBtnY, resetBtnW, resetBtnH);
      drawButton(cookBtnImg, cookBtnX, cookBtnY, cookBtnW, cookBtnH);
      drawButton(backBtnImg, mainBackBtnX, mainBackBtnY, mainBackBtnW, mainBackBtnH);
      let btnSize = width * 0.055;
      drawButton(flipHImg, flipHX, flipHY, btnSize, btnSize);
      drawButton(flipVImg, flipVX, flipVY, btnSize, btnSize);
      for (let s of spawnerTraits) s.display();
      for (let t of traits) { t.update(); t.display(); }
      if (selectedTrait) selectedTrait.drawHandles();
      break;

    case 'cook':
      image(bgImg2, 0, 0, width, height);
      for (let t of traits) { t.update(); t.display(); }
      if (!takingScreenshot && !isTransforming) { // Also hide buttons during animation
        drawButton(backBtnImg, backBtnX, backBtnY, backBtnW, backBtnH);
        drawButton(screenshotBtnImg, screenshotBtnX, screenshotBtnY, screenshotBtnW, screenshotBtnH);
      }
      break;
  }
  
  // --- Handle the transformation animation overlay ---
  if (isTransforming) {
    let elapsedTime = millis() - transformationStartTime;
    
    if (elapsedTime > TRANSFORMATION_DURATION) {
      isTransforming = false; 
    } else {
      // --- MODIFIED SECTION: FADE-OUT LOGIC ---
      push();
      
      // Calculate the alpha (transparency). It will go from 255 (opaque) down to 0 (invisible).
      let fadeAlpha = map(elapsedTime, 0, TRANSFORMATION_DURATION, 255, 0);
      
      // Apply the transparency before drawing the image
      tint(255, fadeAlpha);
      
      imageMode(CENTER);
      image(boomGif, width / 2, height / 2, width, height); 
      pop(); // pop() resets the tint so it doesn't affect anything else
    }
  }

  if (takingScreenshot) {
    saveCanvas('happy-pride-month', 'png');
    takingScreenshot = false;
  }
}

function isMouseOver(x, y, w, h) {
  return mouseX > x && mouseX < x + w && mouseY > y && mouseY < y + h;
}

function mousePressed() {
  if (currentScene === 'intro' || currentScene === 'tutorial') {
    userStartAudio();
  }

  if (isTransforming) return;

  switch (currentScene) {
    case 'intro':
      if (isMouseOver(playBtnX, playBtnY, playBtnW, playBtnH)) currentScene = 'main';
      if (isMouseOver(tutorialBtnX, tutorialBtnY, tutorialBtnW, tutorialBtnH)) currentScene = 'tutorial';
      break;
    case 'tutorial':
      if (isMouseOver(homeBtnX, homeBtnY, homeBtnW, homeBtnH)) currentScene = 'main';
      break;
    case 'main':
      handleMainSceneMousePress();
      break;
    case 'cook':
      if (isMouseOver(backBtnX, backBtnY, backBtnW, backBtnH)) currentScene = 'main';
      if (isMouseOver(screenshotBtnX, screenshotBtnY, screenshotBtnW, screenshotBtnH)) takingScreenshot = true;
      break;
  }
}

function handleMainSceneMousePress() {
    if (isMouseOver(mainBackBtnX, mainBackBtnY, mainBackBtnW, mainBackBtnH)) {
      currentScene = 'intro';
      traits = []; 
      selectedTrait = null;
      return;
    }

    let flipButtonSize = width * 0.055;
    if (isMouseOver(flipHX, flipHY, flipButtonSize, flipButtonSize)) {
      if (selectedTrait) selectedTrait.flipH *= -1; return;
    }
    if (isMouseOver(flipVX, flipVY, flipButtonSize, flipButtonSize)) {
      if (selectedTrait) selectedTrait.flipV *= -1; return;
    }
    if (isMouseOver(resetBtnX, resetBtnY, resetBtnW, resetBtnH)) {
      traits = []; selectedTrait = null; return;
    }

    if (isMouseOver(cookBtnX, cookBtnY, cookBtnW, cookBtnH)) {
      currentScene = 'cook';
      isTransforming = true;
      transformationStartTime = millis();
      transformationSound.play();
      selectedTrait = null;               
      return; 
    }
    
    if (isMouseOver(trashX, trashY, trashW, trashH)) {
      if (selectedTrait) {
        let index = traits.indexOf(selectedTrait);
        if (index > -1) traits.splice(index, 1);
        selectedTrait = null;
      }
      return;
    }

    if (selectedTrait) {
      if (selectedTrait.isOverResizeHandle(mouseX, mouseY)) {
        resizing = true; selectedTrait.startResizing(mouseX, mouseY); return;
      } else if (selectedTrait.isOverRotateHandle(mouseX, mouseY)) {
        rotating = true; selectedTrait.startRotating(mouseX, mouseY); return;
      }
    }

    let clickedAny = false;
    for (let i = traits.length - 1; i >= 0; i--) {
      if (traits[i].pressed(mouseX, mouseY)) {
        traits.push(traits.splice(i, 1)[0]);
        selectedTrait = traits[traits.length - 1];
        clickedAny = true;
        break;
      }
    }

    if (!clickedAny) {
      for (let i = spawnerTraits.length - 1; i >= 0; i--) {
        if (spawnerTraits[i].pressed(mouseX, mouseY)) {
          clickedAny = true;
          break;
        }
      }
    }

    if (!clickedAny) selectedTrait = null;
}

function mouseDragged() {
  if (isTransforming) return;
  if (currentScene === 'main' && selectedTrait) {
    if (resizing) selectedTrait.resize(mouseX, mouseY);
    if (rotating) selectedTrait.rotateTo(mouseX, mouseY);
  }
}

function mouseReleased() {
  resizing = false;
  rotating = false;
  for (let t of traits) t.released();
}

function drawButton(img, x, y, w, h) {
  push();
  const imgAspect = img.width / img.height;
  const containerAspect = w / h;
  let drawW, drawH;
  if (imgAspect > containerAspect) {
    drawW = w; drawH = w / imgAspect;
  } else {
    drawH = h; drawW = h * imgAspect;
  }
  const padding = 0.8; 
  drawW *= padding; drawH *= padding;
  if (isMouseOver(x, y, w, h) && !isTransforming) {
    drawingContext.shadowBlur = 15;
    drawingContext.shadowColor = color(255, 150, 200);
  }
  imageMode(CENTER);
  image(img, x + w / 2, y + h / 2, drawW, drawH);
  drawingContext.shadowBlur = 0;
  pop();
}

class Trait {
  constructor(x, y, isTrait, img, options = {}) {
    this.x = x; this.y = y; this.img = img; this.isTrait = isTrait;
    this.spawnScale = options.spawnScale || 0.3;
    if (options.targetWidth && this.img.width > 0) {
      let longestSide = max(this.img.width, this.img.height);
      this.scale = options.targetWidth / longestSide;
    } else if (options.initialScale) {
      this.scale = options.initialScale;
    } else {
      this.scale = 1;
    }
    this.rotation = 0; this.flipH = 1; this.flipV = 1;
    this.dragging = false; this.offsetX = 0; this.offsetY = 0;
    this.initialDistance = 0; this.initialScale = this.scale;
    this.initialAngle = 0; this.initialRotation = 0;
    this.handleSize = width * 0.01;
    this.updateSize();
  }
  updateSize() { this.width = this.img.width * this.scale; this.height = this.img.height * this.scale; }
  display() {
    let hovered = dist(mouseX, mouseY, this.x, this.y) < max(this.width, this.height) / 2;
    push();
    translate(this.x, this.y); rotate(this.rotation); scale(this.flipH, this.flipV);
    imageMode(CENTER);
    if (hovered && !this.dragging && selectedTrait !== this) {
      drawingContext.shadowBlur = 40; drawingContext.shadowColor = color(255, 255, 255);
    }
    if (selectedTrait === this && currentScene === 'main') {
      drawingContext.shadowBlur = 30; drawingContext.shadowColor = color(255, 255, 255);
    }
    let sizeMult = hovered ? 1.05 : 1;
    image(this.img, 0, 0, this.width * sizeMult, this.height * sizeMult);
    drawingContext.shadowBlur = 0;
    if (selectedTrait === this && currentScene === 'main') {
      noFill(); stroke(255); strokeWeight(2); rectMode(CENTER);
      rect(0, 0, this.width + 4, this.height + 4);
    }
    pop();
  }
  update() { if (this.dragging) { this.x = mouseX + this.offsetX; this.y = mouseY + this.offsetY; } }
  pressed(mx, my) {
    let cosA = cos(-this.rotation); let sinA = sin(-this.rotation);
    let dx = mx - this.x; let dy = my - this.y;
    let rotatedX = dx * cosA - dy * sinA; let rotatedY = dx * sinA + dy * cosA;
    if (abs(rotatedX) < this.width / 2 && abs(rotatedY) < this.height / 2) {
      if (!this.isTrait) {
        let t = new Trait(width / 2, height / 2, true, this.img, { initialScale: this.spawnScale });
        traits.push(t); selectedTrait = t;
        selectedTrait.dragging = true;
        selectedTrait.offsetX = selectedTrait.x - mx; selectedTrait.offsetY = selectedTrait.y - my;
        return true;
      } else {
        this.dragging = true; this.offsetX = this.x - mx; this.offsetY = this.y - my;
        selectedTrait = this;
        return true;
      }
    }
    return false;
  }
  released() { this.dragging = false; }
  isOverResizeHandle(mx, my) { let pos = this.getResizeHandlePosition(); return dist(mx, my, pos.x, pos.y) < this.handleSize; }
  isOverRotateHandle(mx, my) { let pos = this.getRotateHandlePosition(); return dist(mx, my, pos.x, pos.y) < this.handleSize; }
  drawHandles() {
    let resize = this.getResizeHandlePosition(); let rotate = this.getRotateHandlePosition();
    push(); fill(255); stroke(0); strokeWeight(1);
    ellipse(resize.x, resize.y, this.handleSize); ellipse(rotate.x, rotate.y, this.handleSize);
    pop();
  }
  getResizeHandlePosition() { let angle = this.rotation; let x = this.x + cos(angle) * this.width / 2; let y = this.y + sin(angle) * this.width / 2; return createVector(x, y); }
  getRotateHandlePosition() { let angle = this.rotation + PI / 2; let x = this.x + cos(angle) * this.height / 2; let y = this.y + sin(angle) * this.height / 2; return createVector(x, y); }
  startResizing(mx, my) { this.initialDistance = dist(mx, my, this.x, this.y); this.initialScale = this.scale; }
  resize(mx, my) { let newDistance = dist(mx, my, this.x, this.y); let scaleFactor = newDistance / this.initialDistance; this.scale = constrain(this.initialScale * scaleFactor, 0.1, 1.0); this.updateSize(); }
  startRotating(mx, my) { this.initialAngle = atan2(my - this.y, mx - this.x); this.initialRotation = this.rotation; }
  rotateTo(mx, my) { let currentAngle = atan2(my - this.y, mx - this.x); this.rotation = this.initialRotation + (currentAngle - this.initialAngle); }
}
