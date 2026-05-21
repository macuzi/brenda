import { text, group, select, confirm, isCancel } from "@clack/prompts";

async function main() {
  // asks user for foreground/background colors
  const colors = await group({
    foreground: () => text({
      message: 'What is your foreground color?',
      validate: (value) => {
        if (!value || value.length !== 3) {
          return 'you must include a foreground color'
        }
      }
    }),

    background: ({ results }) => text({
      message: 'What is yoru background color?',
      placeholder: 'enter',
      validate: (value) => {
        if (!value) {
          return 
        }
      }
    })
  })

  console.log(colors)
}

main()