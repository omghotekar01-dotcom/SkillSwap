#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define SERVICE_FILE "services.txt"

void writeSampleServices(void) {
    const char *services[] = {
        "AI Tutoring|High-quality mentoring for college AI projects",
        "Note Sharing|Summary notes for engineering and computer science",
        "Web Design Help|Create landing pages, portfolios, and app UI",
        "Debug Support|Fix bugs and optimize C, Python, and JS code",
        NULL
    };

    FILE *file = fopen(SERVICE_FILE, "w");
    if (!file) {
        perror("Unable to write service file");
        return;
    }

    for (int i = 0; services[i]; i++) {
        fprintf(file, "%s\n", services[i]);
    }
    fclose(file);
}

void searchServices(const char *query) {
    FILE *file = fopen(SERVICE_FILE, "r");
    if (!file) {
        printf("Service file missing. Creating samples...\n");
        writeSampleServices();
        file = fopen(SERVICE_FILE, "r");
        if (!file) return;
    }

    printf("Search results for '%s':\n", query);
    char line[256];
    int found = 0;
    while (fgets(line, sizeof(line), file)) {
        if (strstr(line, query) != NULL) {
            printf("  %s", line);
            found = 1;
        }
    }

    if (!found) {
        printf("  No matching services found.\n");
    }
    fclose(file);
}

int main(int argc, char *argv[]) {
    printf("Service Search Demo\n");
    writeSampleServices();

    const char *query = argc > 1 ? argv[1] : "AI";
    searchServices(query);
    return 0;
}
