# Skillswap Campus

Monorepo structure for the Skillswap Campus project.

## C Demo Programs

This project includes a `c-programs/` folder with sample C programs demonstrating file handling and simple console utilities:

- `notes_manager.c` — saves and lists notes using a text file.
- `service_search.c` — writes sample service listings and performs a keyword search.
- `sort_ratings.c` — sorts rating values and writes sorted output to a file.
- `student_records.c` — creates and displays sample student records in CSV format.

These files are intended as C-language demo examples for academic presentation.

## Terminal C Mode

A new terminal-based launcher is available at `run_terminal.bat`.

- Compile and run the C terminal app with `run_terminal.bat`.
- If you prefer PowerShell, use `run_terminal.ps1`.
- The launcher detects `gcc`, `clang`, or `cl` automatically.

The C terminal app provides:
- notes manager (view and add notes)
- service search demo
- ratings sorter
- student record viewer
- website mode instructions

A single entry point is available at `start.bat`.
- Run `start.bat` from the repo root.
- Choose option 1 for terminal C mode.
- Choose option 2 to show website startup instructions.

VS Code task support is also configured.
- Run the `Build and Run Skillswap Terminal` task from the command palette.
- Run `Run Skillswap Website Instructions` to see how to start the browser mode.

The website remains unchanged. Use `run_website.bat` for instructions to start the frontend and backend in browser mode.
