#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h>

#define NOTE_FILE "notes.txt"
#define SERVICE_FILE "services.txt"
#define STUDENT_FILE "students.csv"
#define MAX_TITLE 80
#define MAX_TEXT 256

static void clearInputBuffer(void)
{
    int ch;
    while ((ch = getchar()) != '\n' && ch != EOF)
    {
        ;
    }
}

static void readLine(char *buffer, size_t size)
{
    if (fgets(buffer, (int)size, stdin) == NULL)
    {
        buffer[0] = '\0';
        return;
    }
    buffer[strcspn(buffer, "\r\n")] = '\0';
}

static int getNextNoteId(void)
{
    FILE *file = fopen(NOTE_FILE, "r");
    if (!file)
    {
        return 1;
    }

    int maxId = 0;
    char line[512];
    while (fgets(line, sizeof(line), file))
    {
        int id;
        if (sscanf(line, "%d|%*[^|]|%*[^\n]", &id) == 1)
        {
            if (id > maxId)
            {
                maxId = id;
            }
        }
    }
    fclose(file);
    return maxId + 1;
}

static void saveNote(int id, const char *title, const char *text)
{
    FILE *file = fopen(NOTE_FILE, "a");
    if (!file)
    {
        perror("Unable to open note file");
        return;
    }
    fprintf(file, "%d|%s|%s\n", id, title, text);
    fclose(file);
}

static void printNotes(void)
{
    FILE *file = fopen(NOTE_FILE, "r");
    if (!file)
    {
        printf("No saved notes yet. Create one with this demo app.\n");
        return;
    }

    printf("Existing notes from %s:\n", NOTE_FILE);
    char line[512];
    while (fgets(line, sizeof(line), file))
    {
        int id;
        char title[MAX_TITLE];
        char text[MAX_TEXT];
        if (sscanf(line, "%d|%79[^|]|%255[^\n]", &id, title, text) == 3)
        {
            printf("  [%d] %s\n    %s\n", id, title, text);
        }
    }
    fclose(file);
}

static char *findCaseInsensitive(const char *haystack, const char *needle)
{
    if (*needle == '\0')
    {
        return (char *)haystack;
    }

    for (; *haystack; haystack++)
    {
        const char *h = haystack;
        const char *n = needle;
        while (*h && *n && tolower((unsigned char)*h) == tolower((unsigned char)*n))
        {
            h++;
            n++;
        }
        if (*n == '\0')
        {
            return (char *)haystack;
        }
    }
    return NULL;
}

static void addNote(void)
{
    char title[MAX_TITLE];
    char text[MAX_TEXT];

    printf("\nEnter note title: ");
    readLine(title, sizeof(title));
    if (title[0] == '\0')
    {
        printf("Title cannot be empty.\n");
        return;
    }

    printf("Enter note text: ");
    readLine(text, sizeof(text));
    if (text[0] == '\0')
    {
        printf("Note text cannot be empty.\n");
        return;
    }

    int id = getNextNoteId();
    saveNote(id, title, text);
    printf("Saved note [%d].\n", id);
}

static void viewNote(void)
{
    char idText[32];
    printf("\nEnter note ID to view: ");
    readLine(idText, sizeof(idText));
    int targetId = atoi(idText);
    if (targetId <= 0)
    {
        printf("Invalid note ID.\n");
        return;
    }

    FILE *file = fopen(NOTE_FILE, "r");
    if (!file)
    {
        printf("No notes found.\n");
        return;
    }

    char line[512];
    int found = 0;
    while (fgets(line, sizeof(line), file))
    {
        int id;
        char title[MAX_TITLE];
        char text[MAX_TEXT];
        if (sscanf(line, "%d|%79[^|]|%255[^\n]", &id, title, text) == 3 && id == targetId)
        {
            printf("\nNote [%d]\nTitle: %s\nText: %s\n", id, title, text);
            found = 1;
            break;
        }
    }
    fclose(file);
    if (!found)
        printf("Note ID %d not found.\n", targetId);
}

static void editNote(void)
{
    char idText[32];
    printf("\nEnter note ID to edit: ");
    readLine(idText, sizeof(idText));
    int targetId = atoi(idText);
    if (targetId <= 0)
    {
        printf("Invalid note ID.\n");
        return;
    }

    char loadedLines[256][512];
    int count = 0;
    FILE *file = fopen(NOTE_FILE, "r");
    if (!file)
    {
        printf("No notes found.\n");
        return;
    }

    int found = 0;
    char line[512];
    while (fgets(line, sizeof(line), file) && count < 256)
    {
        strcpy(loadedLines[count++], line);
        int id;
        char title[MAX_TITLE], text[MAX_TEXT];
        if (sscanf(line, "%d|%79[^|]|%255[^\n]", &id, title, text) == 3 && id == targetId)
        {
            found = 1;
        }
    }
    fclose(file);

    if (!found)
    {
        printf("Note ID %d not found.\n", targetId);
        return;
    }

    for (int i = 0; i < count; i++)
    {
        int id;
        char title[MAX_TITLE], text[MAX_TEXT];
        if (sscanf(loadedLines[i], "%d|%79[^|]|%255[^\n]", &id, title, text) != 3)
            continue;
        if (id != targetId)
            continue;

        printf("Editing note [%d] %s\n", id, title);
        printf("New title (empty to leave unchanged): ");
        char newTitle[MAX_TITLE];
        readLine(newTitle, sizeof(newTitle));
        printf("New text (empty to leave unchanged): ");
        char newText[MAX_TEXT];
        readLine(newText, sizeof(newText));

        if (newTitle[0])
            strncpy(title, newTitle, sizeof(title) - 1);
        if (newText[0])
            strncpy(text, newText, sizeof(text) - 1);

        snprintf(loadedLines[i], sizeof(loadedLines[i]), "%d|%s|%s\n", id, title, text);
        break;
    }

    FILE *out = fopen(NOTE_FILE, "w");
    if (!out)
    {
        printf("Failed to save notes.\n");
        return;
    }
    for (int i = 0; i < count; i++)
        fputs(loadedLines[i], out);
    fclose(out);
    printf("Note updated.\n");
}

static void deleteNote(void)
{
    char idText[32];
    printf("\nEnter note ID to delete: ");
    readLine(idText, sizeof(idText));
    int targetId = atoi(idText);
    if (targetId <= 0)
    {
        printf("Invalid note ID.\n");
        return;
    }

    char loadedLines[256][512];
    int count = 0;
    FILE *file = fopen(NOTE_FILE, "r");
    if (!file)
    {
        printf("No notes found.\n");
        return;
    }

    int found = 0;
    char line[512];
    while (fgets(line, sizeof(line), file) && count < 256)
    {
        int id;
        char title[MAX_TITLE], text[MAX_TEXT];
        if (sscanf(line, "%d|%79[^|]|%255[^\n]", &id, title, text) == 3 && id == targetId)
        {
            found = 1;
            continue; /* skip copying this line */
        }
        strcpy(loadedLines[count++], line);
    }
    fclose(file);

    if (!found)
    {
        printf("Note ID %d not found.\n", targetId);
        return;
    }

    FILE *out = fopen(NOTE_FILE, "w");
    if (!out)
    {
        printf("Failed to save notes.\n");
        return;
    }
    for (int i = 0; i < count; i++)
        fputs(loadedLines[i], out);
    fclose(out);
    printf("Note deleted.\n");
}

static void notesMenu(void)
{
    while (1)
    {
        printf("\nNotes Menu:\n");
        printf("1) List notes\n");
        printf("2) View note\n");
        printf("3) Create note\n");
        printf("4) Edit note\n");
        printf("5) Delete note\n");
        printf("6) Back to main menu\n");
        printf("Choose an option: ");

        char choice[8];
        readLine(choice, sizeof(choice));
        if (choice[0] == '1')
            printNotes();
        else if (choice[0] == '2')
            viewNote();
        else if (choice[0] == '3')
            addNote();
        else if (choice[0] == '4')
            editNote();
        else if (choice[0] == '5')
            deleteNote();
        else if (choice[0] == '6' || choice[0] == '0')
            break;
        else
            printf("Invalid option.\n");
    }
}

static void writeSampleServices(void)
{
    const char *services[] = {
        "1|AI Tutoring|High-quality mentoring for college AI projects|coding|750|2|AI,Tutoring",
        "2|Note Sharing|Summary notes for engineering and computer science|notes|399|1|Notes,Summary",
        "3|Web Design Help|Create landing pages, portfolios, and app UI|design|1200|3|Web,Design",
        "4|Debug Support|Fix bugs and optimize C, Python, and JS code|coding|650|2|Debug,Code",
        NULL};

    FILE *file = fopen(SERVICE_FILE, "w");
    if (!file)
    {
        perror("Unable to write service file");
        return;
    }

    for (int i = 0; services[i]; i++)
    {
        fprintf(file, "%s\n", services[i]);
    }
    fclose(file);
}

static int parseServiceLine(const char *line, int *id, char *title, size_t titleSize, char *description, size_t descSize, char *category, size_t catSize, int *price, int *deliveryDays, char *tags, size_t tagsSize)
{
    char temp[1024];
    strncpy(temp, line, sizeof(temp) - 1);
    temp[sizeof(temp) - 1] = '\0';

    char *fields[8] = {0};
    char *ptr = temp;
    for (int i = 0; i < 8; i++)
    {
        fields[i] = ptr;
        char *sep = strchr(ptr, '|');
        if (!sep)
        {
            if (i < 6)
                return 0;
            break;
        }
        *sep = '\0';
        ptr = sep + 1;
    }

    if (!fields[0] || !fields[1] || !fields[2] || !fields[3] || !fields[4] || !fields[5])
        return 0;

    *id = atoi(fields[0]);
    strncpy(title, fields[1], titleSize - 1);
    title[titleSize - 1] = '\0';
    strncpy(description, fields[2], descSize - 1);
    description[descSize - 1] = '\0';
    strncpy(category, fields[3], catSize - 1);
    category[catSize - 1] = '\0';
    *price = atoi(fields[4]);
    *deliveryDays = atoi(fields[5]);
    if (fields[6])
    {
        strncpy(tags, fields[6], tagsSize - 1);
        tags[tagsSize - 1] = '\0';
    }
    else
    {
        tags[0] = '\0';
    }
    return 1;
}

static int getNextServiceId(void)
{
    FILE *file = fopen(SERVICE_FILE, "r");
    if (!file)
    {
        return 1;
    }

    int maxId = 0;
    char line[1024];
    while (fgets(line, sizeof(line), file))
    {
        int id;
        char title[128], desc[512], category[64], tags[256];
        int price, deliveryDays;
        if (parseServiceLine(line, &id, title, sizeof(title), desc, sizeof(desc), category, sizeof(category), &price, &deliveryDays, tags, sizeof(tags)))
        {
            if (id > maxId)
                maxId = id;
        }
    }
    fclose(file);
    return maxId + 1;
}

static void listServices(void)
{
    FILE *file = fopen(SERVICE_FILE, "r");
    if (!file)
    {
        printf("No services file found. Creating sample services...\n");
        writeSampleServices();
        file = fopen(SERVICE_FILE, "r");
        if (!file)
        {
            perror("Unable to open service file");
            return;
        }
    }

    printf("\nMarketplace Services:\n");
    char line[1024];
    int count = 0;
    while (fgets(line, sizeof(line), file))
    {
        line[strcspn(line, "\r\n")] = '\0'; /* Strip newline */
        int id, price, deliveryDays;
        char title[128], desc[512], category[64], tags[256];
        if (parseServiceLine(line, &id, title, sizeof(title), desc, sizeof(desc), category, sizeof(category), &price, &deliveryDays, tags, sizeof(tags)))
        {
            count++;
            printf("[%d] %s\n  Category: %s | Price: ₹%d | Delivery: %d days\n  %s\n  Tags: %s\n\n", id, title, category, price, deliveryDays, desc, tags[0] ? tags : "none");
        }
    }
    fclose(file);
    if (count == 0)
        printf("No services found.\n");
}

static int saveAllServices(const char lines[][1024], int count)
{
    FILE *file = fopen(SERVICE_FILE, "w");
    if (!file)
        return 0;
    for (int i = 0; i < count; i++)
    {
        fprintf(file, "%s\n", lines[i]);
    }
    fclose(file);
    return 1;
}

static void sanitizeServiceFile(void)
{
    FILE *file = fopen(SERVICE_FILE, "r");
    if (!file)
        return;

    char buffer[128][1024];
    int count = 0;
    int seenIds[128];
    char line[1024];

    while (fgets(line, sizeof(line), file) && count < 128)
    {
        line[strcspn(line, "\r\n")] = '\0';
        int id, price, deliveryDays;
        char title[128], desc[512], category[64], tags[256];
        if (!parseServiceLine(line, &id, title, sizeof(title), desc, sizeof(desc), category, sizeof(category), &price, &deliveryDays, tags, sizeof(tags)))
            continue;

        if (id <= 0)
            continue;

        int duplicate = 0;
        for (int i = 0; i < count; i++)
        {
            if (seenIds[i] == id)
            {
                duplicate = 1;
                break;
            }
        }
        if (duplicate)
            continue;

        seenIds[count] = id;
        strncpy(buffer[count], line, sizeof(buffer[count]) - 1);
        buffer[count][sizeof(buffer[count]) - 1] = '\0';
        count++;
    }
    fclose(file);

    if (count > 0)
        saveAllServices(buffer, count);
}

static void searchServices(const char *query)
{
    FILE *file = fopen(SERVICE_FILE, "r");
    if (!file)
    {
        printf("Service file missing. Creating sample services...\n");
        writeSampleServices();
        file = fopen(SERVICE_FILE, "r");
        if (!file)
        {
            perror("Unable to open service file");
            return;
        }
    }

    printf("Search results for '%s':\n", query);
    char line[256];
    int found = 0;
    while (fgets(line, sizeof(line), file))
    {
        if (findCaseInsensitive(line, query) != NULL)
        {
            printf("  %s", line);
            found = 1;
        }
    }

    if (!found)
    {
        printf("  No matching services found.\n");
    }
    fclose(file);
}

static void appendServiceLine(char *line, size_t size, int id, const char *title, const char *description, const char *category, int price, int deliveryDays, const char *tags)
{
    snprintf(line, size, "%d|%s|%s|%s|%d|%d|%s", id, title, description, category, price, deliveryDays, tags);
}

static void createService(void)
{
    char title[128];
    char description[512];
    char category[64];
    char priceText[32];
    char deliveryText[32];
    char tags[256];

    printf("\nCreate a new service\n");
    printf("Title: ");
    readLine(title, sizeof(title));
    printf("Description: ");
    readLine(description, sizeof(description));
    printf("Category: ");
    readLine(category, sizeof(category));
    printf("Price (₹): ");
    readLine(priceText, sizeof(priceText));
    printf("Delivery days: ");
    readLine(deliveryText, sizeof(deliveryText));
    printf("Tags (comma separated): ");
    readLine(tags, sizeof(tags));

    if (title[0] == '\0' || description[0] == '\0')
    {
        printf("Title and description are required.\n");
        return;
    }

    int price = atoi(priceText);
    int deliveryDays = atoi(deliveryText);
    if (price <= 0 || deliveryDays <= 0)
    {
        printf("Price and delivery days must be positive numbers.\n");
        return;
    }

    int id = getNextServiceId();
    char line[1024];
    appendServiceLine(line, sizeof(line), id, title, description, category[0] ? category : "other", price, deliveryDays, tags[0] ? tags : "none");

    FILE *file = fopen(SERVICE_FILE, "a");
    if (!file)
    {
        perror("Unable to append service");
        return;
    }
    fprintf(file, "%s\n", line);
    fclose(file);

    printf("Service created with ID %d.\n", id);
}

static void editService(void)
{
    char idText[32];
    printf("\nEnter service ID to edit: ");
    readLine(idText, sizeof(idText));
    int targetId = atoi(idText);
    if (targetId <= 0)
    {
        printf("Invalid service ID.\n");
        return;
    }

    char loadedLines[128][1024];
    int count = 0;
    FILE *file = fopen(SERVICE_FILE, "r");
    if (!file)
    {
        printf("Service file not found.\n");
        return;
    }

    int found = 0;
    char line[1024];
    while (fgets(line, sizeof(line), file) && count < 128)
    {
        strcpy(loadedLines[count++], line);
        int id, price, deliveryDays;
        char title[128], desc[512], category[64], tags[256];
        if (parseServiceLine(line, &id, title, sizeof(title), desc, sizeof(desc), category, sizeof(category), &price, &deliveryDays, tags, sizeof(tags)) && id == targetId)
        {
            found = 1;
        }
    }
    fclose(file);

    if (!found)
    {
        printf("Service ID %d not found.\n", targetId);
        return;
    }

    for (int i = 0; i < count; i++)
    {
        int id, price, deliveryDays;
        char title[128], desc[512], category[64], tags[256];
        if (!parseServiceLine(loadedLines[i], &id, title, sizeof(title), desc, sizeof(desc), category, sizeof(category), &price, &deliveryDays, tags, sizeof(tags)))
            continue;
        if (id != targetId)
            continue;

        printf("Editing service [%d] %s\n", id, title);
        printf("New title (empty to leave unchanged): ");
        char newTitle[128];
        readLine(newTitle, sizeof(newTitle));
        printf("New description: ");
        char newDesc[512];
        readLine(newDesc, sizeof(newDesc));
        printf("New category: ");
        char newCategory[64];
        readLine(newCategory, sizeof(newCategory));
        printf("New price: ");
        char newPriceText[32];
        readLine(newPriceText, sizeof(newPriceText));
        printf("New delivery days: ");
        char newDeliveryText[32];
        readLine(newDeliveryText, sizeof(newDeliveryText));
        printf("New tags: ");
        char newTags[256];
        readLine(newTags, sizeof(newTags));

        if (newTitle[0])
            strcpy(title, newTitle);
        if (newDesc[0])
            strcpy(desc, newDesc);
        if (newCategory[0])
            strcpy(category, newCategory);
        if (newPriceText[0])
            price = atoi(newPriceText);
        if (newDeliveryText[0])
            deliveryDays = atoi(newDeliveryText);
        if (newTags[0])
            strcpy(tags, newTags);

        appendServiceLine(loadedLines[i], sizeof(loadedLines[i]), id, title, desc, category, price, deliveryDays, tags[0] ? tags : "none");
        break;
    }

    if (!saveAllServices(loadedLines, count))
    {
        printf("Failed to save updated services.\n");
        return;
    }
    printf("Service updated.\n");
}

static void deleteService(void)
{
    char idText[32];
    printf("\nEnter service ID to delete: ");
    readLine(idText, sizeof(idText));
    int targetId = atoi(idText);
    if (targetId <= 0)
    {
        printf("Invalid service ID.\n");
        return;
    }

    char loadedLines[128][1024];
    int count = 0;
    FILE *file = fopen(SERVICE_FILE, "r");
    if (!file)
    {
        printf("Service file not found.\n");
        return;
    }

    int found = 0;
    char line[1024];
    while (fgets(line, sizeof(line), file) && count < 128)
    {
        int id, price, deliveryDays;
        char title[128], desc[512], category[64], tags[256];
        if (parseServiceLine(line, &id, title, sizeof(title), desc, sizeof(desc), category, sizeof(category), &price, &deliveryDays, tags, sizeof(tags)) && id == targetId)
        {
            found = 1;
            continue;
        }
        strcpy(loadedLines[count++], line);
    }
    fclose(file);

    if (!found)
    {
        printf("Service ID %d not found.\n", targetId);
        return;
    }

    if (!saveAllServices(loadedLines, count))
    {
        printf("Failed to delete service.\n");
        return;
    }
    printf("Service deleted.\n");
}

static void servicesMenu(void)
{
    while (1)
    {
        printf("\nMarketplace Services Menu:\n");
        printf("1) List all services\n");
        printf("2) Search services\n");
        printf("3) Create a service\n");
        printf("4) Edit a service\n");
        printf("5) Delete a service\n");
        printf("6) Back to main menu\n");
        printf("Choose an option: ");

        char choice[8];
        readLine(choice, sizeof(choice));

        if (choice[0] == '1')
        {
            listServices();
        }
        else if (choice[0] == '2')
        {
            char query[256];
            printf("Enter search term: ");
            readLine(query, sizeof(query));
            if (query[0])
                searchServices(query);
            else
                printf("Search term is required.\n");
        }
        else if (choice[0] == '3')
        {
            createService();
        }
        else if (choice[0] == '4')
        {
            editService();
        }
        else if (choice[0] == '5')
        {
            deleteService();
        }
        else if (choice[0] == '6' || choice[0] == '0')
        {
            break;
        }
        else
        {
            printf("Invalid option.\n");
        }
    }
}

static int compareDescending(const void *a, const void *b)
{
    return (*(int *)b) - (*(int *)a);
}

static void sortRatings(void)
{
    int ratings[16];
    int count = 0;
    char input[64];

    printf("\nSort sample ratings or enter your own values?\n");
    printf("1) Use sample ratings\n");
    printf("2) Enter ratings manually\n");
    printf("Choose an option: ");
    readLine(input, sizeof(input));

    if (input[0] == '2')
    {
        printf("Enter up to 16 ratings separated by spaces: ");
        readLine(input, sizeof(input));
        char *token = strtok(input, " \t");
        while (token && count < 16)
        {
            ratings[count++] = atoi(token);
            token = strtok(NULL, " \t");
        }
        if (count == 0)
        {
            printf("No ratings entered. Using the sample list.\n");
        }
    }

    if (count == 0)
    {
        int sample[] = {4, 5, 2, 5, 3, 4, 5, 1};
        count = sizeof(sample) / sizeof(sample[0]);
        memcpy(ratings, sample, sizeof(sample));
    }

    printf("Original ratings: ");
    for (int i = 0; i < count; i++)
    {
        printf("%d ", ratings[i]);
    }
    printf("\n");

    qsort(ratings, count, sizeof(int), compareDescending);

    printf("Sorted ratings:   ");
    for (int i = 0; i < count; i++)
    {
        printf("%d ", ratings[i]);
    }
    printf("\n");
}

static void writeSampleStudentRecords(void)
{
    FILE *file = fopen(STUDENT_FILE, "w");
    if (!file)
    {
        perror("Unable to open student record file");
        return;
    }

    fprintf(file, "ID,Name,Semester,College,GPA\n");
    fprintf(file, "1001,Ankit Kumar,4,Demo College,8.7\n");
    fprintf(file, "1002,Priya Sharma,3,Demo College,9.1\n");
    fprintf(file, "1003,Rahul Singh,2,Demo College,8.2\n");
    fclose(file);
}

static void printStudentRecords(void)
{
    FILE *file = fopen(STUDENT_FILE, "r");
    if (!file)
    {
        printf("No student records found. Creating sample records...\n");
        writeSampleStudentRecords();
        file = fopen(STUDENT_FILE, "r");
        if (!file)
        {
            perror("Unable to open student file");
            return;
        }
    }

    printf("Student records from %s:\n", STUDENT_FILE);
    char line[256];
    while (fgets(line, sizeof(line), file))
    {
        printf("%s", line);
    }
    fclose(file);
}

static void showWebsiteInstructions(void)
{
    printf("\nWebsite mode is still available. To run it:\n");
    printf("  1) Open %s\\backend and run: npm run dev\n", ".");
    printf("  2) Open %s\\frontend and run: npm run dev\n", ".");
    printf("Then visit the browser at http://localhost:5173.\n");
}

static void startBackend(void)
{
    printf("Starting backend in a new terminal window...\n");
    /* Runs a new maximized cmd window and starts npm in backend */
    /* run npm install first, then start dev */
    system("start \"Backend\" /MAX cmd /k \"cd /d ..\\backend && if exist package.json npm install && npm run dev\"");
}

static void startFrontend(void)
{
    printf("Starting frontend in a new terminal window...\n");
    /* Runs a new maximized cmd window and starts npm in frontend */
    system("start \"Frontend\" /MAX cmd /k \"cd /d ..\\frontend && if exist package.json npm install && npm run dev\"");
}

static void openWebsiteInBrowser(void)
{
    printf("Opening website in default browser...\n");
    system("start http://localhost:5173");
}

static void initializeServices(void)
{
    FILE *file = fopen(SERVICE_FILE, "r");
    if (!file)
    {
        printf("Initializing marketplace services file...\n");
        writeSampleServices();
    }
    else
    {
        fclose(file);
        sanitizeServiceFile();
    }
}

int main(void)
{
    int choice = 0;
    char input[16];

    printf("Skillswap Terminal Mode\n");
    printf("Use this C-based terminal alternative alongside the website.\n");

    /* Initialize services.txt if it doesn't exist */
    initializeServices();

    while (1)
    {
        printf("=== Main Menu ===\n");
        printf("1) Notes management\n");
        printf("2) Marketplace services\n");
        printf("3) Sort ratings\n");
        printf("4) View student records\n");
        printf("5) Start backend (npm run dev)\n");
        printf("6) Start frontend (npm run dev)\n");
        printf("7) Open website in browser\n");
        printf("8) Start website mode (backend + frontend)\n");
        printf("9) Exit\n");
        printf("Choose an option: ");

        readLine(input, sizeof(input));
        choice = atoi(input);

        switch (choice)
        {
        case 1:
            /* Open notes management menu (list/view/create/edit/delete) */
            {
                extern void notesMenu(void);
                notesMenu();
            }
            break;
        case 2:
            servicesMenu();
            break;
        case 3:
            sortRatings();
            break;
        case 4:
            printStudentRecords();
            break;
        case 5:
            startBackend();
            break;
        case 6:
            startFrontend();
            break;
        case 7:
            openWebsiteInBrowser();
            break;
        case 8:
            startBackend();
            startFrontend();
            openWebsiteInBrowser();
            break;
        case 9:
            printf("Goodbye!\n");
            return 0;
        default:
            printf("Invalid choice, please pick 1-9.\n");
            break;
        }
    }

    return 0;
}
