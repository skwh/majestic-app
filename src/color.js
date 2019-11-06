// From Material Design (https://material.io/design/color/the-color-system.html#tools-for-picking-colors)
const colors = [ 
  "#F44336", // Red 500
  "#E91E63", // Pink 500
  "#9C27B0", // Purple 500
  "#673AB7", // Deep Purple 500
  "#3F51B5", // Indigo 500
  "#2196F3", // Blue 500
  "#03A9F4", // Light Blue 500
  "#00BCD4", // Cyan 500
  "#009688", // Teal 500
  "#4CAF50", // Green 500
  "#8BC34A", // Light Green 500
  "#CDDC39", // Lime 500
  "#FFEB3B", // Yellow 500
  "#FFC107", // Amber 500
  "#FF9800", // Orange 500
  "#FF5722", // Deep Orange 500
  "#795548", // Brown 500
  "#9E9E9E", // Gray 500
  "#607D8B"  // Blue Gray 500
];

const randomColor = () => colors[Math.floor(Math.random() * colors.length) + 1];

module.exports = {
  colors: colors,
  random: randomColor
}