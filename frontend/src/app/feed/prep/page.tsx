"use client";
import { useState } from "react";
import { Database, Code, Server, BrainCircuit, Network, Layers, GitBranch, X, PlayCircle, Trophy, CheckCircle2, XCircle, ChevronRight, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Question = { q: string; a: string };
type QuizQuestion = { q: string; options: string[]; correct: number; explanation: string };
type Topic = {
  id: string; title: string; description: string;
  icon: React.ElementType; color: string;
  questions: Question[]; quiz: QuizQuestion[];
};

const PREP_TOPICS: Topic[] = [
  {
    id: "dsa", title: "Data Structures & Algorithms",
    description: "Master arrays, trees, graphs, and dynamic programming.",
    icon: Code, color: "from-blue-500 to-cyan-400",
    questions: [
      { q: "What is a Binary Search Tree?", a: "A node-based binary tree where left child < parent < right child, enabling O(log n) search." },
      { q: "Explain the difference between BFS and DFS.", a: "BFS explores layer by layer using a Queue. DFS goes deep first using a Stack or recursion." },
      { q: "What is Dynamic Programming?", a: "Breaks complex problems into overlapping subproblems and stores results to avoid redundant computation." },
      { q: "How does a Hash Map work?", a: "Uses a hash function to map keys to array indices, giving O(1) average time for search/insert/delete." },
      { q: "What is the time complexity of QuickSort?", a: "Average O(n log n), worst case O(n²) when pivot is always min/max element." },
      { q: "What is a Heap data structure?", a: "A complete binary tree where parent is always greater (max-heap) or smaller (min-heap) than children. Used in priority queues. Build time O(n), insert/delete O(log n)." },
      { q: "Explain Sliding Window technique.", a: "Maintains a window of elements over an array/string to solve subarray/substring problems in O(n) instead of O(n²). Window expands/shrinks based on conditions." },
      { q: "What is the difference between a Stack and a Queue?", a: "Stack is LIFO (Last In First Out) — used in function calls, undo operations. Queue is FIFO (First In First Out) — used in BFS, task scheduling." },
    ],
    quiz: [
      { q: "What data structure does BFS use internally?", options: ["Stack", "Queue", "Heap", "Tree"], correct: 1, explanation: "BFS uses a Queue to explore nodes level by level." },
      { q: "What is the worst-case time complexity of QuickSort?", options: ["O(n log n)", "O(n²)", "O(n)", "O(log n)"], correct: 1, explanation: "When the pivot is always the smallest or largest element, QuickSort degrades to O(n²)." },
      { q: "Which data structure is used in a recursive DFS?", options: ["Queue", "Stack", "Array", "Linked List"], correct: 1, explanation: "DFS uses a Stack (implicitly via recursion call stack, or explicitly)." },
      { q: "What is the average time complexity of HashMap lookup?", options: ["O(n)", "O(log n)", "O(1)", "O(n²)"], correct: 2, explanation: "Hash maps provide O(1) average time for lookups using a hash function." },
      { q: "In a BST, where is the smallest element located?", options: ["Root", "Rightmost node", "Leftmost node", "Any leaf"], correct: 2, explanation: "In a BST, the leftmost node always holds the smallest value." },
    ],
  },
  {
    id: "dbms", title: "Database Management Systems",
    description: "Learn SQL, normalization, ACID properties, and indexing.",
    icon: Database, color: "from-purple-500 to-pink-500",
    questions: [
      { q: "What are ACID properties?", a: "Atomicity, Consistency, Isolation, Durability — guarantees for reliable DB transactions." },
      { q: "Explain Normalization.", a: "Organizing data to reduce redundancy by dividing tables and linking via relationships." },
      { q: "What is a Primary Key vs Foreign Key?", a: "Primary Key uniquely identifies a row. Foreign Key links to another table's Primary Key." },
      { q: "What is an Index?", a: "A B-Tree structure that speeds up data retrieval at the cost of extra space and slower writes." },
      { q: "Difference between SQL and NoSQL?", a: "SQL is relational and schema-based. NoSQL is flexible, storing documents, key-value pairs, or graphs." },
      { q: "What is a Transaction?", a: "A sequence of DB operations treated as a single unit. Either all operations succeed (commit) or all are undone (rollback)." },
      { q: "What is a JOIN? Name its types.", a: "Combines rows from two tables. Types: INNER JOIN (matching rows), LEFT JOIN (all left + matching right), RIGHT JOIN, FULL OUTER JOIN (all rows from both)." },
      { q: "What is a View in SQL?", a: "A virtual table based on a SELECT query. Simplifies complex queries, provides security by restricting column access, and doesn't store data physically." },
    ],
    quiz: [
      { q: "Which ACID property ensures a transaction is all-or-nothing?", options: ["Consistency", "Isolation", "Atomicity", "Durability"], correct: 2, explanation: "Atomicity ensures the entire transaction succeeds or is fully rolled back." },
      { q: "What does normalization primarily reduce?", options: ["Query speed", "Data redundancy", "Index size", "Table count"], correct: 1, explanation: "Normalization reduces data redundancy and improves data integrity." },
      { q: "Which normal form eliminates partial dependencies?", options: ["1NF", "2NF", "3NF", "BCNF"], correct: 1, explanation: "2NF removes partial dependencies on a composite primary key." },
      { q: "What data structure do most database indexes use?", options: ["Hash Map", "B-Tree", "Linked List", "Stack"], correct: 1, explanation: "Most DB indexes use B-Trees for efficient range queries and lookups." },
      { q: "Which SQL clause filters groups after aggregation?", options: ["WHERE", "GROUP BY", "HAVING", "ORDER BY"], correct: 2, explanation: "HAVING filters results after GROUP BY aggregation, unlike WHERE which filters rows before." },
    ],
  },
  {
    id: "os", title: "Operating Systems",
    description: "Understand processes, threads, memory management, and deadlocks.",
    icon: Server, color: "from-green-500 to-emerald-400",
    questions: [
      { q: "What is a Process vs Thread?", a: "A process has its own memory space. A thread shares memory with its parent process but has its own stack." },
      { q: "What is a Deadlock?", a: "When processes are blocked waiting for resources held by each other, creating a circular wait." },
      { q: "Explain Virtual Memory.", a: "Abstracts physical RAM, allowing programs to use more memory than physically available via paging." },
      { q: "What is Paging?", a: "Divides memory into fixed-size pages/frames to eliminate external fragmentation." },
      { q: "What is a Mutex vs Semaphore?", a: "Mutex is a binary lock for one thread. Semaphore is a counter allowing N threads simultaneously." },
      { q: "What is CPU Scheduling?", a: "The OS decides which process runs on the CPU. Algorithms: FCFS, SJF, Round Robin, Priority Scheduling. Goal: maximize CPU utilization and minimize wait time." },
      { q: "What is the difference between Internal and External Fragmentation?", a: "Internal fragmentation: wasted space inside an allocated block. External fragmentation: free memory exists but is scattered in non-contiguous chunks." },
      { q: "What is a System Call?", a: "An interface between a user program and the OS kernel. Examples: fork(), exec(), read(), write(). Switches CPU from user mode to kernel mode." },
    ],
    quiz: [
      { q: "Which of the four conditions is NOT required for a deadlock?", options: ["Mutual Exclusion", "Preemption", "Hold and Wait", "Circular Wait"], correct: 1, explanation: "Deadlock requires No Preemption (resources can't be forcibly taken). Preemption prevents deadlock." },
      { q: "What does a context switch involve?", options: ["Killing a process", "Saving and restoring CPU state", "Allocating new memory", "Creating a new thread"], correct: 1, explanation: "A context switch saves the current process state and restores another process's state." },
      { q: "Which scheduling algorithm can cause starvation?", options: ["Round Robin", "FCFS", "Priority Scheduling", "SRTF"], correct: 2, explanation: "Priority Scheduling can starve low-priority processes if high-priority ones keep arriving." },
      { q: "What is thrashing in OS?", options: ["CPU overheating", "Excessive paging causing low CPU utilization", "Memory leak", "Deadlock state"], correct: 1, explanation: "Thrashing occurs when the OS spends more time swapping pages than executing processes." },
      { q: "A semaphore with value 1 is equivalent to a:", options: ["Spinlock", "Mutex", "Monitor", "Condition Variable"], correct: 1, explanation: "A binary semaphore (value 0 or 1) behaves like a mutex for mutual exclusion." },
    ],
  },
  {
    id: "ml", title: "Machine Learning & AI",
    description: "Dive into regression, classification, neural networks, and deep learning.",
    icon: BrainCircuit, color: "from-terracotta to-[#E9B44C]",
    questions: [
      { q: "Supervised vs Unsupervised Learning?", a: "Supervised uses labeled data (classification/regression). Unsupervised finds patterns in unlabeled data (clustering)." },
      { q: "What is Overfitting?", a: "Model memorizes training data including noise, performing poorly on new unseen data." },
      { q: "What is a Neural Network?", a: "Layers of interconnected nodes that learn patterns by adjusting weights through backpropagation." },
      { q: "Explain Gradient Descent.", a: "Iteratively moves in the direction of steepest descent of the loss function to minimize error." },
      { q: "What is the Bias-Variance Tradeoff?", a: "High bias = underfitting, high variance = overfitting. A good model balances both to generalize well." },
      { q: "What is Cross-Validation?", a: "Technique to evaluate model generalization. K-Fold CV splits data into K subsets, trains on K-1 and tests on 1, rotating K times. Reduces overfitting risk." },
      { q: "What is the difference between Precision and Recall?", a: "Precision = TP/(TP+FP) — of all predicted positives, how many are correct. Recall = TP/(TP+FN) — of all actual positives, how many were found. F1-score balances both." },
      { q: "What is a Convolutional Neural Network (CNN)?", a: "A deep learning architecture for image data. Uses convolutional layers to detect spatial features (edges, textures), pooling layers to reduce dimensions, and fully connected layers for classification." },
    ],
    quiz: [
      { q: "Which technique helps prevent overfitting?", options: ["Adding more layers", "Dropout / Regularization", "Increasing learning rate", "Removing training data"], correct: 1, explanation: "Dropout and L1/L2 regularization reduce overfitting by preventing the model from memorizing training data." },
      { q: "What does the learning rate control in gradient descent?", options: ["Number of epochs", "Step size toward minimum", "Number of layers", "Batch size"], correct: 1, explanation: "The learning rate determines how large each step is when updating weights during gradient descent." },
      { q: "Which algorithm is used for classification AND regression?", options: ["K-Means", "PCA", "Decision Tree", "DBSCAN"], correct: 2, explanation: "Decision Trees can handle both classification and regression tasks." },
      { q: "What is the activation function that solves the vanishing gradient problem?", options: ["Sigmoid", "Tanh", "ReLU", "Softmax"], correct: 2, explanation: "ReLU (Rectified Linear Unit) avoids vanishing gradients by outputting 0 for negatives and x for positives." },
      { q: "K-Means is an example of:", options: ["Supervised Learning", "Reinforcement Learning", "Unsupervised Learning", "Semi-supervised Learning"], correct: 2, explanation: "K-Means is an unsupervised clustering algorithm that groups data without labels." },
    ],
  },
  {
    id: "sysdesign", title: "System Design",
    description: "Learn scalability, load balancing, caching, and distributed systems.",
    icon: Network, color: "from-orange-500 to-amber-400",
    questions: [
      { q: "What is Horizontal vs Vertical Scaling?", a: "Vertical scaling adds more power (CPU/RAM) to one machine. Horizontal scaling adds more machines. Horizontal is preferred for high availability and fault tolerance." },
      { q: "What is a Load Balancer?", a: "Distributes incoming traffic across multiple servers to prevent overload. Algorithms: Round Robin, Least Connections, IP Hash. Improves availability and throughput." },
      { q: "What is Caching and when to use it?", a: "Stores frequently accessed data in fast memory (Redis, Memcached) to reduce DB load and latency. Use for read-heavy workloads. Strategies: LRU, LFU, Write-through, Write-back." },
      { q: "What is a CDN?", a: "Content Delivery Network — distributes static assets (images, JS, CSS) to edge servers geographically close to users, reducing latency and origin server load." },
      { q: "What is the CAP Theorem?", a: "A distributed system can guarantee only 2 of 3: Consistency (all nodes see same data), Availability (every request gets a response), Partition Tolerance (system works despite network splits)." },
      { q: "What is Database Sharding?", a: "Horizontally partitions data across multiple DB instances (shards) based on a shard key. Improves write scalability but adds complexity in cross-shard queries." },
      { q: "What is a Message Queue?", a: "Decouples producers and consumers using async communication (Kafka, RabbitMQ, SQS). Enables buffering, retry logic, and independent scaling of services." },
      { q: "What is the difference between SQL and NoSQL for system design?", a: "SQL for structured data with complex queries and ACID needs. NoSQL (MongoDB, Cassandra, DynamoDB) for high write throughput, flexible schemas, and horizontal scaling." },
    ],
    quiz: [
      { q: "Which scaling approach adds more machines instead of upgrading one?", options: ["Vertical Scaling", "Horizontal Scaling", "Database Sharding", "Caching"], correct: 1, explanation: "Horizontal scaling (scale-out) adds more servers, enabling better fault tolerance and near-infinite capacity." },
      { q: "What does the 'P' in CAP theorem stand for?", options: ["Performance", "Persistence", "Partition Tolerance", "Parallelism"], correct: 2, explanation: "Partition Tolerance means the system continues operating even if network partitions occur between nodes." },
      { q: "Which caching eviction policy removes the least recently used item?", options: ["FIFO", "LFU", "LRU", "Random"], correct: 2, explanation: "LRU (Least Recently Used) evicts the item that hasn't been accessed for the longest time." },
      { q: "What is the primary purpose of a message queue like Kafka?", options: ["Store files", "Decouple services with async communication", "Load balance HTTP requests", "Cache database queries"], correct: 1, explanation: "Message queues decouple producers and consumers, enabling async processing, buffering, and independent scaling." },
      { q: "Database sharding primarily improves:", options: ["Read consistency", "Write scalability", "Query complexity", "Data normalization"], correct: 1, explanation: "Sharding distributes write load across multiple DB instances, improving write throughput and horizontal scalability." },
    ],
  },
  {
    id: "networks", title: "Computer Networks",
    description: "Understand TCP/IP, HTTP, DNS, OSI model, and network security.",
    icon: GitBranch, color: "from-teal-500 to-cyan-500",
    questions: [
      { q: "What are the 7 layers of the OSI model?", a: "Physical, Data Link, Network, Transport, Session, Presentation, Application. Mnemonic: 'Please Do Not Throw Sausage Pizza Away'." },
      { q: "What is the difference between TCP and UDP?", a: "TCP is connection-oriented, reliable, ordered delivery with handshake (HTTP, FTP). UDP is connectionless, faster, no guarantee (DNS, video streaming, gaming)." },
      { q: "What happens when you type a URL in a browser?", a: "DNS resolves domain → TCP 3-way handshake → TLS handshake (HTTPS) → HTTP request sent → server responds → browser renders HTML/CSS/JS." },
      { q: "What is DNS?", a: "Domain Name System — translates human-readable domain names (google.com) to IP addresses. Hierarchy: Root → TLD (.com) → Authoritative nameserver." },
      { q: "What is the difference between HTTP and HTTPS?", a: "HTTPS = HTTP + TLS/SSL encryption. Encrypts data in transit, authenticates server via certificates, prevents man-in-the-middle attacks. Uses port 443 vs HTTP's 80." },
      { q: "What is a 3-Way TCP Handshake?", a: "SYN (client → server), SYN-ACK (server → client), ACK (client → server). Establishes a reliable connection before data transfer begins." },
      { q: "What is the difference between IPv4 and IPv6?", a: "IPv4: 32-bit addresses (~4.3B). IPv6: 128-bit addresses (340 undecillion). IPv6 solves address exhaustion and has built-in security (IPSec)." },
      { q: "What is a Firewall?", a: "Network security device that monitors and filters incoming/outgoing traffic based on rules. Types: Packet filtering, Stateful inspection, Application-layer (WAF)." },
    ],
    quiz: [
      { q: "Which layer of the OSI model handles IP addressing and routing?", options: ["Data Link", "Transport", "Network", "Session"], correct: 2, explanation: "The Network layer (Layer 3) handles logical addressing (IP) and routing packets between networks." },
      { q: "Which protocol is used for reliable, ordered data delivery?", options: ["UDP", "ICMP", "TCP", "ARP"], correct: 2, explanation: "TCP provides reliable, ordered, error-checked delivery via connection establishment and acknowledgments." },
      { q: "What port does HTTPS use by default?", options: ["80", "8080", "22", "443"], correct: 3, explanation: "HTTPS uses port 443. HTTP uses port 80. SSH uses port 22." },
      { q: "DNS primarily translates:", options: ["IP to MAC address", "Domain names to IP addresses", "HTTP to HTTPS", "IPv4 to IPv6"], correct: 1, explanation: "DNS resolves human-readable domain names (e.g., google.com) into machine-readable IP addresses." },
      { q: "How many packets are exchanged in a TCP 3-way handshake?", options: ["1", "2", "3", "4"], correct: 2, explanation: "Three packets: SYN, SYN-ACK, ACK — establishing a reliable connection before data transfer." },
    ],
  },
  {
    id: "oop", title: "OOP & Design Patterns",
    description: "Master SOLID principles, design patterns, and object-oriented concepts.",
    icon: Layers, color: "from-violet-500 to-purple-400",
    questions: [
      { q: "What are the 4 pillars of OOP?", a: "Encapsulation (bundling data + methods), Abstraction (hiding complexity), Inheritance (reusing parent class), Polymorphism (same interface, different behavior)." },
      { q: "What is the SOLID principle?", a: "S: Single Responsibility, O: Open/Closed, L: Liskov Substitution, I: Interface Segregation, D: Dependency Inversion. Guidelines for maintainable OOP design." },
      { q: "What is the Singleton Pattern?", a: "Ensures a class has only one instance and provides a global access point. Used for DB connections, config managers. Risk: global state makes testing harder." },
      { q: "What is the Observer Pattern?", a: "Defines a one-to-many dependency. When one object (subject) changes state, all dependents (observers) are notified automatically. Used in event systems, MVC." },
      { q: "What is the Factory Pattern?", a: "Creates objects without specifying the exact class. A factory method/interface decides which subclass to instantiate. Promotes loose coupling." },
      { q: "What is the difference between Abstract Class and Interface?", a: "Abstract class can have implementation + state, supports single inheritance. Interface defines a contract (pure abstraction), supports multiple implementation. Use interface for 'can-do', abstract for 'is-a'." },
      { q: "What is Composition over Inheritance?", a: "Prefer building complex behavior by combining simple objects (composition) rather than deep inheritance chains. More flexible, avoids fragile base class problem." },
      { q: "What is the Strategy Pattern?", a: "Defines a family of algorithms, encapsulates each one, and makes them interchangeable. Lets the algorithm vary independently from clients that use it. Example: sorting strategies." },
    ],
    quiz: [
      { q: "Which OOP pillar hides internal implementation details?", options: ["Inheritance", "Polymorphism", "Abstraction", "Encapsulation"], correct: 2, explanation: "Abstraction hides complex implementation and exposes only the necessary interface to the user." },
      { q: "The 'O' in SOLID stands for:", options: ["Object Composition", "Open/Closed Principle", "Observer Pattern", "Overloading"], correct: 1, explanation: "Open/Closed Principle: classes should be open for extension but closed for modification." },
      { q: "Which pattern ensures only one instance of a class exists?", options: ["Factory", "Observer", "Strategy", "Singleton"], correct: 3, explanation: "The Singleton pattern restricts instantiation to one object and provides a global access point." },
      { q: "Which pattern is best for implementing an event notification system?", options: ["Singleton", "Factory", "Observer", "Strategy"], correct: 2, explanation: "The Observer pattern defines a one-to-many dependency, perfect for event-driven notification systems." },
      { q: "'Composition over Inheritance' means:", options: ["Never use inheritance", "Prefer combining objects over extending classes", "Use abstract classes always", "Avoid interfaces"], correct: 1, explanation: "Composition builds behavior by combining objects, offering more flexibility than deep inheritance hierarchies." },
    ],
  },
];

type QuizState = "idle" | "running" | "finished";

export default function PrepHub() {
  const [activeTopic, setActiveTopic] = useState<Topic | null>(null);
  const [view, setView] = useState<"cheatsheet" | "quiz">("cheatsheet");

  // Quiz state
  const [quizState, setQuizState] = useState<QuizState>("idle");
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [showExplanation, setShowExplanation] = useState(false);

  const openTopic = (topic: Topic, startView: "cheatsheet" | "quiz" = "cheatsheet") => {
    setActiveTopic(topic);
    setView(startView);
    resetQuiz();
  };

  const resetQuiz = () => {
    setQuizState("idle");
    setCurrentQ(0);
    setSelected(null);
    setAnswers([]);
    setShowExplanation(false);
  };

  const startQuiz = () => {
    resetQuiz();
    setQuizState("running");
  };

  const handleSelect = (optIdx: number) => {
    if (selected !== null) return;
    setSelected(optIdx);
    setShowExplanation(true);
  };

  const handleNext = () => {
    if (!activeTopic) return;
    const newAnswers = [...answers, selected];
    setAnswers(newAnswers);
    if (currentQ + 1 >= activeTopic.quiz.length) {
      setAnswers(newAnswers);
      setQuizState("finished");
    } else {
      setCurrentQ(prev => prev + 1);
      setSelected(null);
      setShowExplanation(false);
    }
  };

  const score = answers.filter((a, i) => activeTopic && a === activeTopic.quiz[i]?.correct).length;

  const closeModal = () => {
    setActiveTopic(null);
    resetQuiz();
  };

  return (
    <div className="w-full pb-20 sm:pt-8 px-4 sm:px-0">
      <div className="mb-8">
        <h1 className="font-headings text-3xl font-bold text-dark-slate dark:text-cream-white">Placement Prep Hub</h1>
        <p className="text-dark-slate/60 dark:text-cream-white/60 mt-2 max-w-lg">
          Review cheat sheets, then test your knowledge with a 5-question quiz and earn points!
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:gap-6">
        {PREP_TOPICS.map((topic) => {
          const Icon = topic.icon;
          return (
            <motion.div key={topic.id} whileHover={{ y: -4 }}
              className="bg-white dark:bg-dark-slate/50 border border-dark-slate/10 dark:border-white/10 rounded-3xl p-4 sm:p-6 cursor-pointer hover:shadow-xl transition-all group overflow-hidden relative flex flex-col"
            >
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${topic.color} rounded-full blur-[80px] opacity-20 group-hover:opacity-40 transition-opacity`} />
              <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br ${topic.color} flex items-center justify-center text-white mb-4 shadow-lg shrink-0`}>
                <Icon size={24} />
              </div>
              <h3 className="font-headings text-base sm:text-lg font-bold text-dark-slate dark:text-cream-white mb-1 leading-snug">{topic.title}</h3>
              <p className="text-dark-slate/60 dark:text-cream-white/60 text-xs sm:text-sm mb-4 flex-1 leading-relaxed">{topic.description}</p>
              <div className="flex flex-col gap-2 border-t border-dark-slate/10 dark:border-white/10 pt-4">
                <button onClick={() => openTopic(topic, "cheatsheet")}
                  className="w-full text-sm font-bold text-dark-slate dark:text-cream-white bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 py-2.5 rounded-xl transition-colors">
                  📖 Cheat Sheet
                </button>
                <button onClick={() => openTopic(topic, "quiz")}
                  className={`w-full text-sm font-bold text-white bg-gradient-to-r ${topic.color} py-2.5 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5`}>
                  <PlayCircle size={15} /> Start Quiz
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {activeTopic && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-cream-white dark:bg-dark-slate w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl shadow-2xl overflow-hidden"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-5 border-b border-dark-slate/10 dark:border-white/10 relative overflow-hidden shrink-0">
                <div className={`absolute inset-0 bg-gradient-to-br ${activeTopic.color} opacity-10`} />
                <div className="flex items-center gap-3 relative z-10">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${activeTopic.color} flex items-center justify-center text-white shadow`}>
                    <activeTopic.icon size={20} />
                  </div>
                  <div>
                    <h2 className="font-headings text-xl font-bold text-dark-slate dark:text-cream-white">{activeTopic.title}</h2>
                    <div className="flex gap-3 mt-0.5">
                      <button onClick={() => { setView("cheatsheet"); resetQuiz(); }}
                        className={`text-xs font-bold transition-colors ${view === "cheatsheet" ? "text-terracotta" : "text-dark-slate/40 dark:text-white/40 hover:text-dark-slate dark:hover:text-white"}`}>
                        📖 Cheat Sheet
                      </button>
                      <button onClick={() => setView("quiz")}
                        className={`text-xs font-bold transition-colors ${view === "quiz" ? "text-terracotta" : "text-dark-slate/40 dark:text-white/40 hover:text-dark-slate dark:hover:text-white"}`}>
                        🧠 Quiz
                      </button>
                    </div>
                  </div>
                </div>
                <button onClick={closeModal} className="text-dark-slate/50 hover:text-dark-slate dark:text-white/50 dark:hover:text-white bg-black/5 dark:bg-white/5 p-2 rounded-full relative z-10">
                  <X size={18} />
                </button>
              </div>

              {/* Cheat Sheet View */}
              {view === "cheatsheet" && (
                <div className="p-5 overflow-y-auto flex-1 space-y-4">
                  {activeTopic.questions.map((item, idx) => (
                    <div key={idx} className="bg-white dark:bg-dark-slate border border-dark-slate/10 dark:border-white/10 rounded-2xl p-4">
                      <h4 className="font-bold text-dark-slate dark:text-cream-white mb-2 flex gap-2">
                        <span className="text-terracotta font-headings shrink-0">Q{idx + 1}.</span> {item.q}
                      </h4>
                      <p className="text-dark-slate/70 dark:text-cream-white/70 text-sm ml-7 border-l-2 border-dark-slate/10 dark:border-white/10 pl-3 leading-relaxed">{item.a}</p>
                    </div>
                  ))}
                  <div className="p-5 bg-gradient-to-br from-terracotta/10 to-[#E9B44C]/10 border border-terracotta/20 rounded-2xl flex items-center justify-between gap-4">
                    <div>
                      <h3 className="font-bold text-dark-slate dark:text-cream-white flex items-center gap-2">
                        <Trophy size={16} className="text-[#E9B44C]" /> Ready to test yourself?
                      </h3>
                      <p className="text-sm text-dark-slate/60 dark:text-cream-white/60 mt-0.5">5 questions · instant feedback · earn points</p>
                    </div>
                    <button onClick={() => { setView("quiz"); startQuiz(); }}
                      className="bg-terracotta text-white px-5 py-2.5 rounded-full font-bold text-sm flex items-center gap-2 hover:bg-terracotta/90 transition whitespace-nowrap">
                      <PlayCircle size={16} /> Start Quiz
                    </button>
                  </div>
                </div>
              )}

              {/* Quiz View */}
              {view === "quiz" && (
                <div className="flex-1 overflow-y-auto p-5">
                  {/* Idle — start screen */}
                  {quizState === "idle" && (
                    <div className="flex flex-col items-center justify-center h-full py-12 text-center gap-5">
                      <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${activeTopic.color} flex items-center justify-center text-white shadow-xl`}>
                        <activeTopic.icon size={40} />
                      </div>
                      <div>
                        <h3 className="font-headings text-2xl font-bold text-dark-slate dark:text-cream-white">{activeTopic.title} Quiz</h3>
                        <p className="text-dark-slate/60 dark:text-cream-white/60 mt-2">5 multiple choice questions · pick the best answer</p>
                      </div>
                      <button onClick={startQuiz}
                        className={`bg-gradient-to-r ${activeTopic.color} text-white px-8 py-3 rounded-full font-bold text-lg flex items-center gap-2 hover:opacity-90 transition shadow-lg`}>
                        <PlayCircle size={20} /> Begin Quiz
                      </button>
                    </div>
                  )}

                  {/* Running */}
                  {quizState === "running" && (
                    <div className="flex flex-col gap-5">
                      {/* Progress */}
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-dark-slate/50 dark:text-cream-white/50">
                          {currentQ + 1} / {activeTopic.quiz.length}
                        </span>
                        <div className="flex-1 h-2 bg-dark-slate/10 dark:bg-white/10 rounded-full overflow-hidden">
                          <div className={`h-full bg-gradient-to-r ${activeTopic.color} transition-all duration-500`}
                            style={{ width: `${((currentQ + 1) / activeTopic.quiz.length) * 100}%` }} />
                        </div>
                      </div>

                      {/* Question */}
                      <div className="bg-white dark:bg-dark-slate/60 border border-dark-slate/10 dark:border-white/10 rounded-2xl p-5">
                        <p className="font-bold text-lg text-dark-slate dark:text-cream-white leading-snug">
                          {activeTopic.quiz[currentQ].q}
                        </p>
                      </div>

                      {/* Options */}
                      <div className="grid grid-cols-1 gap-3">
                        {activeTopic.quiz[currentQ].options.map((opt, i) => {
                          const isCorrect = i === activeTopic.quiz[currentQ].correct;
                          const isSelected = i === selected;
                          let style = "border-dark-slate/10 dark:border-white/10 hover:border-terracotta bg-white dark:bg-dark-slate/40";
                          if (selected !== null) {
                            if (isCorrect) style = "border-green-500 bg-green-50 dark:bg-green-900/20";
                            else if (isSelected) style = "border-red-500 bg-red-50 dark:bg-red-900/20";
                            else style = "border-dark-slate/10 dark:border-white/10 opacity-50 bg-white dark:bg-dark-slate/40";
                          }
                          return (
                            <button key={i} onClick={() => handleSelect(i)} disabled={selected !== null}
                              className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all font-medium text-dark-slate dark:text-cream-white flex items-center justify-between gap-3 ${style}`}>
                              <span><span className="font-bold text-terracotta mr-2">{String.fromCharCode(65 + i)}.</span>{opt}</span>
                              {selected !== null && isCorrect && <CheckCircle2 size={18} className="text-green-500 shrink-0" />}
                              {selected !== null && isSelected && !isCorrect && <XCircle size={18} className="text-red-500 shrink-0" />}
                            </button>
                          );
                        })}
                      </div>

                      {/* Explanation */}
                      <AnimatePresence>
                        {showExplanation && (
                          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                            className={`p-4 rounded-xl border text-sm leading-relaxed ${selected === activeTopic.quiz[currentQ].correct ? "bg-green-50 dark:bg-green-900/20 border-green-500/30 text-green-800 dark:text-green-300" : "bg-red-50 dark:bg-red-900/20 border-red-500/30 text-red-800 dark:text-red-300"}`}>
                            <span className="font-bold">{selected === activeTopic.quiz[currentQ].correct ? "✅ Correct! " : "❌ Incorrect. "}</span>
                            {activeTopic.quiz[currentQ].explanation}
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {selected !== null && (
                        <button onClick={handleNext}
                          className={`w-full bg-gradient-to-r ${activeTopic.color} text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition`}>
                          {currentQ + 1 >= activeTopic.quiz.length ? "See Results" : "Next Question"} <ChevronRight size={18} />
                        </button>
                      )}
                    </div>
                  )}

                  {/* Finished */}
                  {quizState === "finished" && (
                    <div className="flex flex-col items-center text-center gap-5 py-8">
                      <div className={`w-24 h-24 rounded-3xl bg-gradient-to-br ${activeTopic.color} flex items-center justify-center text-white shadow-xl text-4xl font-headings font-bold`}>
                        {score}/{activeTopic.quiz.length}
                      </div>
                      <div>
                        <h3 className="font-headings text-2xl font-bold text-dark-slate dark:text-cream-white">
                          {score === 5 ? "🏆 Perfect Score!" : score >= 3 ? "🎉 Well Done!" : "📚 Keep Practicing!"}
                        </h3>
                        <p className="text-dark-slate/60 dark:text-cream-white/60 mt-1">
                          You got {score} out of {activeTopic.quiz.length} correct
                          {score === 5 ? " — Excellent mastery!" : score >= 3 ? " — Good understanding!" : " — Review the cheat sheet and try again."}
                        </p>
                      </div>

                      {/* Per-question review */}
                      <div className="w-full space-y-2 text-left">
                        {activeTopic.quiz.map((q, i) => (
                          <div key={i} className={`flex items-start gap-3 p-3 rounded-xl border text-sm ${answers[i] === q.correct ? "border-green-500/30 bg-green-50 dark:bg-green-900/10" : "border-red-500/30 bg-red-50 dark:bg-red-900/10"}`}>
                            {answers[i] === q.correct
                              ? <CheckCircle2 size={16} className="text-green-500 shrink-0 mt-0.5" />
                              : <XCircle size={16} className="text-red-500 shrink-0 mt-0.5" />}
                            <div>
                              <p className="font-medium text-dark-slate dark:text-cream-white">{q.q}</p>
                              {answers[i] !== q.correct && (
                                <p className="text-xs text-dark-slate/60 dark:text-cream-white/60 mt-0.5">
                                  Correct: <span className="font-bold text-green-600 dark:text-green-400">{q.options[q.correct]}</span>
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="flex gap-3 w-full">
                        <button onClick={startQuiz}
                          className="flex-1 flex items-center justify-center gap-2 border-2 border-dark-slate/20 dark:border-white/20 text-dark-slate dark:text-cream-white py-3 rounded-xl font-bold hover:bg-black/5 dark:hover:bg-white/5 transition">
                          <RotateCcw size={16} /> Retry
                        </button>
                        <button onClick={() => { setView("cheatsheet"); resetQuiz(); }}
                          className={`flex-1 bg-gradient-to-r ${activeTopic.color} text-white py-3 rounded-xl font-bold hover:opacity-90 transition`}>
                          📖 Review Sheet
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
