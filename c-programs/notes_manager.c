#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define NOTE_FILE "notes.txt"
#define MAX_TITLE 80
#define MAX_TEXT 256

void saveNote(int id, const char *title, const char *text) {
    FILE *file = fopen(NOTE_FILE, "a");
    if (!file) {
        perror("Unable to open note file");
        return;
    }
    fprintf(file, "%d|%s|%s\n", id, title, text);
    fclose(file);
}

void printNotes(void) {
    FILE *file = fopen(NOTE_FILE, "r");
    if (!file) {
        printf("No saved notes yet. Create one with this demo app.\n");
        return;
    }

    printf("Existing notes from %s:\n", NOTE_FILE);
    char line[512];
    while (fgets(line, sizeof(line), file)) {
        int id;
        char title[MAX_TITLE];
        char text[MAX_TEXT];
        if (sscanf(line, "%d|%79[^|]|%255[^"]", &id, title, text) == 3) {
            printf("  [%d] %s\n    %s\n", id, title, text);
        }
    }
    fclose(file);
}

int main(void) {
    printf("Notes Manager Demo\n");
    printNotes();

    printf("\nAdding sample notes...\n");
    saveNote(1, "Study Plan", "Write C program demos and practice file handling.");
    saveNote(2, "Campus Chat", "Show sample messaging feature using C file storage.");

    printf("\nNotes after save:\n");
    printNotes();
    return 0;
}
