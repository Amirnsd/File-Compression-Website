# Project

This project was created using the [Ktor Project Generator](https://start.ktor.io).

Here are some useful links to get you started:

- [Ktor Documentation](https://ktor.io/docs/home.html)
- [Ktor GitHub page](https://github.com/ktorio/ktor)
- The [Ktor Slack chat](https://app.slack.com/client/T09229ZC6/C0A974TJ9). You'll need to [request an invite](https://surveys.jetbrains.com/s3/kotlin-slack-sign-up) to join.

## Features

Here's a list of features included in this project:

| Name                                               | Description                                                 |
| ----------------------------------------------------|------------------------------------------------------------- |
| [Routing](https://start.ktor.io/p/routing-default) | Allows to define structured routes and associated handlers. |

## Building & Running

To build or run the project, use one of the following tasks:

| Task                                    | Description                                                          |
| -----------------------------------------|---------------------------------------------------------------------- |
| `./gradlew test`                        | Run the tests                                                        |
| `./gradlew build`                       | Build everything                                                     |
| `./gradlew buildFatJar`                 | Build an executable JAR of the server with all dependencies included |
| `./gradlew buildImage`                  | Build the docker image to use with the fat JAR                       |
| `./gradlew publishImageToLocalRegistry` | Publish the docker image locally                                     |
| `./gradlew run`                         | Run the server                                                       |
| `./gradlew runDocker`                   | Run using the local docker image                                     |

If the server starts successfully, you'll see the following output:

```
2024-12-04 14:32:45.584 [main] INFO  Application - Application started in 0.303 seconds.
2024-12-04 14:32:45.682 [main] INFO  Application - Responding at http://0.0.0.0:8080
```

# 🗜️ File Compression Tool

A modern, full-stack web application for file compression and decompression built with **Kotlin/Ktor** backend and **Vanilla JavaScript** frontend.

---

## 👥 Team Members & Division of Work

| Task | Members |
|------|---------|
| **Algorithm Core** | Amirhossein Nosratoddin |
| **Testing & Validation** | Mutasim Sazedin, Hujaifa Muaz |
| **File I/O and Controller** | Ahmed Arman |
| **GUI Design** | Jongyeon Lee |

---

## 📋 Project Overview

This tool provides a user-friendly interface for compressing and decompressing files in multiple formats with features like password protection, batch processing, and compression history tracking.

### **Key Features**
- ✅ Multiple compression formats (GZIP, ZIP, DEFLATE, TAR.GZ)
- ✅ Password-protected archives (AES-256 encryption)
- ✅ Batch file processing
- ✅ Interactive GUI with drag & drop
- ✅ Compression level selection (Fast/Normal/Maximum)
- ✅ History tracking with statistics
- ✅ Dark/Light mode interface

---

## 🎓 Professor Feedback Implementation

### **Original Feedback**
> "Include user handling and password protecting (saved in database securely). Using only one algorithm is not enough (for a group with 5 persons). You have to use multiple compression techniques and compare the file compression size. With interactive GUI. All types of files should be considered."

### **How We Addressed It**

✅ **Multiple Compression Algorithms**: Implemented 4 different compression techniques
- GZIP (DEFLATE algorithm)
- ZIP (with AES-256 encryption)
- DEFLATE (raw compression)
- TAR.GZ (combination format)

✅ **Password Protection**: 
- Secure AES-256 encryption for ZIP files
- Password-protected archive creation and extraction
- Client-side history storage (IndexedDB) instead of database

✅ **Compression Comparison**:
- Real-time statistics showing original vs compressed size
- Compression ratio calculation for each operation
- History dashboard comparing different compression methods
- Multiple compression levels (Fast/Normal/Maximum) for comparison

✅ **Interactive GUI**:
- Modern web interface with drag & drop
- Real-time progress indicators
- Visual file preview
- Responsive design
- Dark/Light theme toggle

✅ **All File Types Supported**:
- Text files (.txt, .log, .csv)
- Documents (.pdf, .docx)
- Images (.jpg, .png, .gif)
- Audio/Video (.mp3, .mp4)
- Archives (.zip, .rar, .tar.gz)
- Any file type can be compressed

---

## 🛠️ Technologies Used

### **Backend**
- **Kotlin 2.2.20** with **Ktor 3.3.1**
- **Apache Commons Compress** (GZIP, TAR.GZ, DEFLATE)
- **Zip4j** (ZIP with AES encryption)
- **JUnrar** (RAR extraction)

### **Frontend**
- **HTML5, CSS3, JavaScript (ES6+)**
- **IndexedDB** for history persistence
- **Pure Vanilla JavaScript** (no frameworks)

---

## 📁 Project Structure

```
Project/
├── src/main/kotlin/
│   ├── Application.kt              # Main entry point
│   ├── Routing.kt                  # Route configuration
│   ├── services/
│   │   └── CompressionService.kt   # Core compression algorithms
│   └── routes/
│       └── CompressionRoutes.kt    # API endpoints
├── src/main/resources/
│   ├── static/
│   │   ├── index.html              # Interactive GUI
│   │   ├── css/styles.css          # Styling
│   │   └── js/
│   │       ├── app.js              # Main logic
│   │       └── storage.js          # History management
│   └── application.conf            # Server config
└── build.gradle.kts                # Dependencies
```

---

## 🚀 How to Run

### **Prerequisites**
- Java JDK 17 or higher
- Modern web browser

### **Steps**

```bash
# Clone repository
git clone https://github.com/Amirnsd/File-Compression-Website.git
cd File-Compression-Website

# Build project
./gradlew build

# Run application
./gradlew run

# Open browser
http://localhost:8080
```

---

## 📖 Usage Instructions

### **Compress Files**
1. Click "Compress" tab
2. Upload files (drag & drop or click)
3. Select format: GZIP, ZIP, DEFLATE, or TAR.GZ
4. Choose compression level: Fast/Normal/Maximum
5. (Optional) Add password for ZIP
6. Click "Compress File(s)"
7. Compare compression statistics

### **Decompress Files**
1. Click "Decompress" tab
2. Upload compressed file
3. Enter password if needed
4. Click "Decompress File"

### **View Compression Comparison**
1. Click "History" tab
2. View statistics:
   - Total space saved
   - Average compression ratio
   - Individual operation details
3. Compare different algorithms and levels

---

## 🎯 Deliverables vs Milestones

### **Deliverables** (Professor's Requirements)
1. ✅ **Project Proposal** - Submitted
2. ✅ **Project Code/Demo** - This repository
3. ✅ **README File** - This document
4. ✅ **Presentation (PPT)** - Prepared

### **Development Milestones** (Internal Checkpoints)
- Week 1: Project setup and architecture design
- Week 2: Algorithm implementation (GZIP, ZIP, DEFLATE, TAR.GZ)
- Week 3: Password protection and security features
- Week 4: Interactive GUI development
- Week 5: Testing and compression comparison features
- Week 6: Documentation and presentation preparation

---

## 🎥 Demo Scenarios

**Scenario 1: Algorithm Comparison**
- Compress same file with GZIP, ZIP, DEFLATE
- Show compression ratio differences
- Demonstrate speed vs size tradeoff

**Scenario 2: Password Protection**
- Create password-protected ZIP
- Fail to extract without password
- Successfully extract with correct password

**Scenario 3: Multiple File Types**
- Compress text, image, PDF, video files
- Show compression efficiency varies by file type
- Display statistics comparison

**Scenario 4: Interactive Features**
- Drag and drop demonstration
- Real-time progress tracking
- Theme toggle and responsive design

---

## 📊 Compression Algorithm Comparison

| Algorithm | Speed | Compression Ratio | Best For |
|-----------|-------|-------------------|----------|
| **GZIP** | Fast | Good (70-80%) | Single files, web |
| **ZIP** | Medium | Good (65-75%) | Multiple files, password |
| **DEFLATE** | Fast | Good (70-80%) | Raw compression |
| **TAR.GZ** | Medium | Best (75-85%) | Multiple files, Linux |

*Ratios based on text files. Image/video compression varies.*

---

## 🔒 Security Features

- **AES-256 Encryption**: Industry-standard security for ZIP files
- **Client-side Storage**: History stored locally (IndexedDB), not on server
- **No Server-side File Storage**: Files processed in-memory only
- **Secure Password Handling**: Passwords not logged or stored

---

## 📈 Project Statistics

- **Total Lines of Code**: ~2,500+
- **Compression Algorithms**: 4 (GZIP, ZIP, DEFLATE, TAR.GZ)
- **Supported File Types**: All types
- **Team Members**: 5
- **Development Time**: 60-80 hours

---

## 🙏 Acknowledgments

- Open-source libraries: Apache Commons Compress, Zip4j, JUnrar

---

**GitHub**: [File-Compression-Website](https://github.com/Amirnsd/File-Compression-Website)
