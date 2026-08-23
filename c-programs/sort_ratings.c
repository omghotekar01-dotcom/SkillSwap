#include <stdio.h>
#include <stdlib.h>

#define OUTPUT_FILE "sorted_ratings.txt"

void saveSortedRatings(int ratings[], int count) {
    FILE *file = fopen(OUTPUT_FILE, "w");
    if (!file) {
        perror("Unable to open output file");
        return;
    }
    fprintf(file, "Sorted ratings:\n");
    for (int i = 0; i < count; i++) {
        fprintf(file, "%d\n", ratings[i]);
    }
    fclose(file);
}

int compare(const void *a, const void *b) {
    return (*(int *)b) - (*(int *)a);
}

int main(void) {
    int ratings[] = { 4, 5, 2, 5, 3, 4, 5, 1 };
    int count = sizeof(ratings) / sizeof(ratings[0]);

    printf("Sort Ratings Demo\n");
    printf("Original ratings: ");
    for (int i = 0; i < count; i++) printf("%d ", ratings[i]);
    printf("\n");

    qsort(ratings, count, sizeof(int), compare);

    printf("Sorted ratings:   ");
    for (int i = 0; i < count; i++) printf("%d ", ratings[i]);
    printf("\nSaving sorted ratings to %s\n", OUTPUT_FILE);
    saveSortedRatings(ratings, count);
    return 0;
}
