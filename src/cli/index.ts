import { group, text, cancel } from "@clack/prompts";
import { checkColorInput, normalizeHexColor } from "../contrast";

async function main() {
  // asks user for foreground/background colors
  const colors = await group({
    foreground: () =>
      text({
        message: "What is your foreground color?",
        validate: (value) => {
          return checkColorInput(value);
        },
      }),
    background: () =>
      text({
        message: "What is your background color?",
        validate: (value) => {
          return checkColorInput(value);
        },
      }),
  },
  {
    onCancel: ({ results }) => {
      cancel("Operation cancelled.");
      process.exit(0);
    },
  });

  // for each color map and pass color to normalize
  for (const color of Object.values(colors)) {
    normalizeHexColor(color);
  }
}

main();
