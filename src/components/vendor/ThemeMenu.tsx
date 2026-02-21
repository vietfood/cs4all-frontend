import * as React from "react"
import { Moon, Sun } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ThemeMenu() {
  const [_, rerender] = React.useState(0)

  const setTheme = (newTheme: string) => {
    const element = document.documentElement
    element.classList.add('[&_*]:transition-none')
    element.setAttribute('data-theme', newTheme)
    element.classList.remove('scheme-dark', 'scheme-light')
    element.classList.add(newTheme.includes('dark') ? 'scheme-dark' : 'scheme-light')

    requestAnimationFrame(() => {
      element.classList.remove('[&_*]:transition-none')
    })

    localStorage.setItem('theme', newTheme)
    rerender(v => v + 1)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" title="Toggle theme" className="-me-2 size-8">
          <Sun className="size-4 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
          <Moon className="absolute size-4 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="backdrop-blur-md" align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("flexoki-light")}>
          Flexoki Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("flexoki-dark")}>
          Flexoki Dark
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
