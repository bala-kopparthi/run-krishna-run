// Shared constants. Keeping these in their own module avoids a circular
// import: scenes need GAME_WIDTH/HEIGHT, and main.js needs the scenes —
// if both lived in main.js, scenes would hit a TDZ ReferenceError.
export const GAME_WIDTH = 480;
export const GAME_HEIGHT = 720;
