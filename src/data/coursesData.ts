import courseCs from "@/assets/course-cs.jpg";
import courseBus from "@/assets/course-bus.jpg";
import courseEng from "@/assets/course-eng.jpg";
import courseEee from "@/assets/course-eee.jpg";
import coursePsy from "@/assets/course-psy.jpg";
import courseMath from "@/assets/course-math.jpg";

export interface NoteItem {
  id: string;
  title: string;
  description: string;
  author: string;
  date: string;
  fileType: string;
  fileSize: string;
  votes: number;
  userVote: 0 | 1 | -1;
}

export interface CourseNotes {
  id: string;
  courseCode: string;
  courseName: string;
  department: string;
  departmentShort: string;
  noteCount: number;
  lastUpdated: string;
  image: string;
  badgeColor: string;
  notes: NoteItem[];
}

export const subjects = [
  "All Departments", "Computer Science", "Business Administration", "English",
  "Electrical Engineering", "Mathematics", "Psychology",
];

export const coursesData: CourseNotes[] = [
  {
    id: "cse110",
    courseCode: "CSE203",
    courseName: "Data Structures",
    department: "Computer Science",
    departmentShort: "COMPUTER SCIENCE",
    noteCount: 64,
    lastUpdated: "Updated 2 days ago",
    image: courseCs,
    badgeColor: "bg-primary/90 text-primary-foreground backdrop-blur-sm",
    notes: [
      { id: "n1", title: "Mid-term Revision: Arrays & Linked Lists", description: "Complete revision notes with code examples and complexity analysis.", author: "Sarah Johnson", date: "2 days ago", fileType: "PDF", fileSize: "4.2 MB", votes: 34, userVote: 0 },
      { id: "n2", title: "Sorting Algorithms Cheat Sheet", description: "Comparison of all major sorting algorithms with Big-O analysis.", author: "Alex Tan", date: "5 days ago", fileType: "PDF", fileSize: "1.8 MB", votes: 28, userVote: 0 },
      { id: "n3", title: "Binary Trees & BST Notes", description: "Lecture 7-9 summary covering tree traversals and balancing.", author: "Fatima Noor", date: "1 week ago", fileType: "DOCX", fileSize: "2.1 MB", votes: 19, userVote: 0 },
      { id: "n4", title: "Graph Theory Basics", description: "BFS, DFS, and shortest path algorithms explained.", author: "Rohan Ahmed", date: "2 weeks ago", fileType: "PDF", fileSize: "3.5 MB", votes: 15, userVote: 0 },
    ],
  },
  {
    id: "cse220",
    courseCode: "CSE205",
    courseName: "Algorithms",
    department: "Computer Science",
    departmentShort: "COMPUTER SCIENCE",
    noteCount: 42,
    lastUpdated: "Updated 5 days ago",
    image: courseCs,
    badgeColor: "bg-primary/90 text-primary-foreground backdrop-blur-sm",
    notes: [
      { id: "n5", title: "Dynamic Programming Patterns", description: "Common DP patterns with step-by-step solutions.", author: "Alex Tan", date: "3 days ago", fileType: "PDF", fileSize: "3.2 MB", votes: 42, userVote: 0 },
      { id: "n6", title: "Greedy Algorithms Summary", description: "When to use greedy vs DP with real examples.", author: "Sarah Johnson", date: "1 week ago", fileType: "PDF", fileSize: "1.5 MB", votes: 22, userVote: 0 },
      { id: "n7", title: "Divide & Conquer Notes", description: "Merge sort, quick sort, and master theorem.", author: "Maria Costa", date: "2 weeks ago", fileType: "DOCX", fileSize: "2.0 MB", votes: 17, userVote: 0 },
    ],
  },
  {
    id: "cse301",
    courseCode: "CSE301",
    courseName: "Operating Systems",
    department: "Computer Science",
    departmentShort: "COMPUTER SCIENCE",
    noteCount: 38,
    lastUpdated: "Updated 1 week ago",
    image: courseCs,
    badgeColor: "bg-primary/90 text-primary-foreground backdrop-blur-sm",
    notes: [
      { id: "n16", title: "Process Scheduling Algorithms", description: "FCFS, SJF, Round Robin with Gantt chart examples.", author: "Rohan Ahmed", date: "1 week ago", fileType: "PDF", fileSize: "2.9 MB", votes: 31, userVote: 0 },
      { id: "n17", title: "Memory Management Notes", description: "Paging, segmentation, and virtual memory concepts.", author: "Alex Tan", date: "2 weeks ago", fileType: "PDF", fileSize: "3.1 MB", votes: 25, userVote: 0 },
    ],
  },
  {
    id: "bus201",
    courseCode: "BUS105",
    courseName: "Business Ethics",
    department: "Business Administration",
    departmentShort: "BUSINESS",
    noteCount: 25,
    lastUpdated: "Updated 3 days ago",
    image: courseBus,
    badgeColor: "bg-stat-amber/90 text-primary-foreground backdrop-blur-sm",
    notes: [
      { id: "n8", title: "Chapter 1-5 Summary", description: "Key formulas, and past paper question analysis.", author: "Rohan Ahmed", date: "Oct 24, 2023", fileType: "DOCX", fileSize: "1.1 MB", votes: 31, userVote: 0 },
      { id: "n9", title: "GDP & Inflation Notes", description: "Detailed notes on GDP calculation and inflation types.", author: "Emily Blunt", date: "Nov 2, 2023", fileType: "PDF", fileSize: "2.4 MB", votes: 18, userVote: 0 },
    ],
  },
  {
    id: "eng101",
    courseCode: "ENG102",
    courseName: "Classic Literature",
    department: "English",
    departmentShort: "ENGLISH",
    noteCount: 56,
    lastUpdated: "Updated 12 hours ago",
    image: courseEng,
    badgeColor: "bg-stat-amber/80 text-primary-foreground backdrop-blur-sm",
    notes: [
      { id: "n10", title: "APA 7th Edition Guide", description: "Presentation slides covering citation and essay structure.", author: "Maria Costa", date: "1 week ago", fileType: "PPTX", fileSize: "8.5 MB", votes: 26, userVote: 0 },
      { id: "n11", title: "Essay Structure Template", description: "Ready-to-use template with examples for each section.", author: "Fatima Noor", date: "2 weeks ago", fileType: "DOCX", fileSize: "0.5 MB", votes: 20, userVote: 0 },
    ],
  },
  {
    id: "eee212",
    courseCode: "EEE212",
    courseName: "Circuit Analysis",
    department: "Electrical Engineering",
    departmentShort: "ENGINEERING",
    noteCount: 7,
    lastUpdated: "Updated yesterday",
    image: courseEee,
    badgeColor: "bg-stat-purple/90 text-primary-foreground backdrop-blur-sm",
    notes: [
      { id: "n12", title: "Thevenin & Norton Theorems", description: "Step-by-step solved problems.", author: "Alex Tan", date: "Yesterday", fileType: "PDF", fileSize: "2.8 MB", votes: 24, userVote: 0 },
    ],
  },
  {
    id: "psy101",
    courseCode: "PSY101",
    courseName: "Foundations of Psychology",
    department: "Psychology",
    departmentShort: "PSYCHOLOGY",
    noteCount: 4,
    lastUpdated: "Updated last week",
    image: coursePsy,
    badgeColor: "bg-destructive/90 text-destructive-foreground backdrop-blur-sm",
    notes: [
      { id: "n13", title: "Behaviorism & Cognitive Psychology", description: "Class notes on key theories and brain anatomy.", author: "Emily Blunt", date: "Oct 20, 2023", fileType: "PDF", fileSize: "5.1 MB", votes: 14, userVote: 0 },
    ],
  },
  {
    id: "mat201",
    courseCode: "MAT201",
    courseName: "Calculus II",
    department: "Mathematics",
    departmentShort: "MATHEMATICS",
    noteCount: 9,
    lastUpdated: "Updated 3 days ago",
    image: courseMath,
    badgeColor: "bg-stat-blue/90 text-primary-foreground backdrop-blur-sm",
    notes: [
      { id: "n14", title: "Integration Techniques Summary", description: "All integration methods with worked examples.", author: "Fatima Noor", date: "3 days ago", fileType: "PDF", fileSize: "3.8 MB", votes: 37, userVote: 0 },
      { id: "n15", title: "Series & Sequences Cheat Sheet", description: "Convergence tests and common series formulas.", author: "Alex Tan", date: "1 week ago", fileType: "PDF", fileSize: "1.2 MB", votes: 29, userVote: 0 },
    ],
  },
];
