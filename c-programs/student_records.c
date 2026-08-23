#include <stdio.h>
#include <stdlib.h>

#define STUDENT_FILE "students.csv"

void writeSampleRecords(void) {
    FILE *file = fopen(STUDENT_FILE, "w");
    if (!file) {
        perror("Unable to open student record file");
        return;
    }
    fprintf(file, "ID,Name,Semester,College,GPA\n");
    fprintf(file, "1001,Ankit Kumar,4,Demo College,8.7\n");
    fprintf(file, "1002,Priya Sharma,3,Demo College,9.1\n");
    fprintf(file, "1003,Rahul Singh,2,Demo College,8.2\n");
    fclose(file);
}

void printStudentRecords(void) {
    FILE *file = fopen(STUDENT_FILE, "r");
    if (!file) {
        printf("No student records found. Creating sample records...\n");
        writeSampleRecords();
        file = fopen(STUDENT_FILE, "r");
        if (!file) return;
    }

    char line[256];
    printf("Student Records from %s:\n", STUDENT_FILE);
    while (fgets(line, sizeof(line), file)) {
        printf("%s", line);
    }
    fclose(file);
}

int main(void) {
    printf("Student Records Demo\n");
    printStudentRecords();
    return 0;
}
