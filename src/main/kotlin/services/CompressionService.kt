package services

import com.github.junrar.Archive
import com.github.junrar.rarfile.FileHeader
import net.lingala.zip4j.ZipFile
import net.lingala.zip4j.model.ZipParameters
import net.lingala.zip4j.model.enums.CompressionLevel
import net.lingala.zip4j.model.enums.EncryptionMethod
import org.apache.commons.compress.archivers.tar.TarArchiveEntry
import org.apache.commons.compress.archivers.tar.TarArchiveInputStream
import org.apache.commons.compress.archivers.tar.TarArchiveOutputStream
import org.apache.commons.compress.compressors.gzip.GzipCompressorInputStream
import org.apache.commons.compress.compressors.gzip.GzipCompressorOutputStream
import org.apache.commons.compress.compressors.gzip.GzipParameters
import java.io.*
import java.util.zip.*

class CompressionService {
    
    enum class CompressionType {
        GZIP, ZIP, DEFLATE, TAR_GZ, RAR
    }
    
    data class CompressionResult(
        val success: Boolean,
        val originalSize: Long,
        val compressedSize: Long,
        val compressionRatio: Double,
        val message: String
    )
    
    data class FileInfo(
        val name: String,
        val size: Long,
        val data: ByteArray
    )
    
    fun compressGzip(inputData: ByteArray, fileName: String, level: Int = Deflater.DEFAULT_COMPRESSION): ByteArray {
        val outputStream = ByteArrayOutputStream()
        val gzipParams = GzipParameters()
        gzipParams.compressionLevel = level
        
        GzipCompressorOutputStream(outputStream, gzipParams).use { gzipOut ->
            gzipOut.write(inputData)
        }
        
        return outputStream.toByteArray()
    }
    
    fun decompressGzip(compressedData: ByteArray): ByteArray {
        val outputStream = ByteArrayOutputStream()
        GZIPInputStream(ByteArrayInputStream(compressedData)).use { gzipInputStream ->
            gzipInputStream.copyTo(outputStream)
        }
        return outputStream.toByteArray()
    }
    
    fun compressZip(inputData: ByteArray, fileName: String, level: Int = Deflater.DEFAULT_COMPRESSION): ByteArray {
        val outputStream = ByteArrayOutputStream()
        ZipOutputStream(outputStream).use { zipOutputStream ->
            zipOutputStream.setLevel(level)
            val entry = ZipEntry(fileName)
            zipOutputStream.putNextEntry(entry)
            zipOutputStream.write(inputData)
            zipOutputStream.closeEntry()
        }
        return outputStream.toByteArray()
    }
    
    fun compressMultipleFilesZip(files: List<FileInfo>, level: Int = Deflater.DEFAULT_COMPRESSION): ByteArray {
        val outputStream = ByteArrayOutputStream()
        ZipOutputStream(outputStream).use { zipOutputStream ->
            zipOutputStream.setLevel(level)
            files.forEach { file ->
                val entry = ZipEntry(file.name)
                zipOutputStream.putNextEntry(entry)
                zipOutputStream.write(file.data)
                zipOutputStream.closeEntry()
            }
        }
        return outputStream.toByteArray()
    }
    
    fun compressZipWithPassword(inputData: ByteArray, fileName: String, password: String, level: Int = Deflater.DEFAULT_COMPRESSION): ByteArray {
        val tempZipFile = File.createTempFile("temp_zip_", ".zip")
        val tempInputFile = File.createTempFile("temp_input_", fileName)
        
        try {
            tempInputFile.writeBytes(inputData)
            
            val zipFile = ZipFile(tempZipFile, password.toCharArray())
            val parameters = ZipParameters()
            parameters.isEncryptFiles = true
            parameters.encryptionMethod = EncryptionMethod.AES
            
            parameters.compressionLevel = when(level) {
                Deflater.BEST_SPEED -> CompressionLevel.FASTEST
                Deflater.BEST_COMPRESSION -> CompressionLevel.ULTRA
                else -> CompressionLevel.NORMAL
            }
            
            zipFile.addFile(tempInputFile, parameters)
            
            return tempZipFile.readBytes()
        } finally {
            tempZipFile.delete()
            tempInputFile.delete()
        }
    }
    
    fun compressMultipleFilesZipWithPassword(files: List<FileInfo>, password: String, level: Int = Deflater.DEFAULT_COMPRESSION): ByteArray {
        val tempZipFile = File.createTempFile("temp_zip_", ".zip")
        val tempFiles = mutableListOf<File>()
        
        try {
            val zipFile = ZipFile(tempZipFile, password.toCharArray())
            val parameters = ZipParameters()
            parameters.isEncryptFiles = true
            parameters.encryptionMethod = EncryptionMethod.AES
            
            parameters.compressionLevel = when(level) {
                Deflater.BEST_SPEED -> CompressionLevel.FASTEST
                Deflater.BEST_COMPRESSION -> CompressionLevel.ULTRA
                else -> CompressionLevel.NORMAL
            }
            
            files.forEach { file ->
                val tempFile = File.createTempFile("temp_", file.name)
                tempFile.writeBytes(file.data)
                tempFiles.add(tempFile)
                zipFile.addFile(tempFile, parameters)
            }
            
            return tempZipFile.readBytes()
        } finally {
            tempZipFile.delete()
            tempFiles.forEach { it.delete() }
        }
    }
    
    fun decompressZip(compressedData: ByteArray): Pair<String, ByteArray> {
        val inputStream = ZipInputStream(ByteArrayInputStream(compressedData))
        inputStream.use { zipInputStream ->
            val entry = zipInputStream.nextEntry
            if (entry != null) {
                val outputStream = ByteArrayOutputStream()
                zipInputStream.copyTo(outputStream)
                return Pair(entry.name, outputStream.toByteArray())
            }
        }
        throw IllegalArgumentException("No entries found in ZIP file")
    }
    
    fun decompressZipWithPassword(compressedData: ByteArray, password: String): Map<String, ByteArray> {
        val tempZipFile = File.createTempFile("temp_zip_", ".zip")
        val tempExtractDir = File.createTempFile("temp_extract_", "")
        tempExtractDir.delete()
        tempExtractDir.mkdir()
        
        try {
            tempZipFile.writeBytes(compressedData)
            val zipFile = ZipFile(tempZipFile, password.toCharArray())
            zipFile.extractAll(tempExtractDir.absolutePath)
            
            val result = mutableMapOf<String, ByteArray>()
            tempExtractDir.walkTopDown().forEach { file ->
                if (file.isFile) {
                    result[file.name] = file.readBytes()
                }
            }
            
            return result
        } finally {
            tempZipFile.delete()
            tempExtractDir.deleteRecursively()
        }
    }
    
    fun compressDeflate(inputData: ByteArray, fileName: String, level: Int = Deflater.DEFAULT_COMPRESSION): ByteArray {
        val outputStream = ByteArrayOutputStream()
        DeflaterOutputStream(outputStream, Deflater(level, true)).use { deflater ->
            deflater.write(inputData)
        }
        return outputStream.toByteArray()
    }
    
    fun decompressDeflate(compressedData: ByteArray): ByteArray {
        val outputStream = ByteArrayOutputStream()
        InflaterInputStream(ByteArrayInputStream(compressedData), Inflater(true)).use { inflater ->
            inflater.copyTo(outputStream)
        }
        return outputStream.toByteArray()
    }
    
    fun compressTarGz(inputData: ByteArray, fileName: String, level: Int = Deflater.DEFAULT_COMPRESSION): ByteArray {
        val outputStream = ByteArrayOutputStream()
        
        val gzipParams = GzipParameters()
        gzipParams.compressionLevel = level
        
        GzipCompressorOutputStream(outputStream, gzipParams).use { gzipOut ->
            TarArchiveOutputStream(gzipOut).use { tarOut ->
                val entry = TarArchiveEntry(fileName)
                entry.size = inputData.size.toLong()
                tarOut.putArchiveEntry(entry)
                tarOut.write(inputData)
                tarOut.closeArchiveEntry()
            }
        }
        
        return outputStream.toByteArray()
    }
    
    fun compressMultipleFilesTarGz(files: List<FileInfo>, level: Int = Deflater.DEFAULT_COMPRESSION): ByteArray {
        val outputStream = ByteArrayOutputStream()
        
        val gzipParams = GzipParameters()
        gzipParams.compressionLevel = level
        
        GzipCompressorOutputStream(outputStream, gzipParams).use { gzipOut ->
            TarArchiveOutputStream(gzipOut).use { tarOut ->
                files.forEach { file ->
                    val entry = TarArchiveEntry(file.name)
                    entry.size = file.data.size.toLong()
                    tarOut.putArchiveEntry(entry)
                    tarOut.write(file.data)
                    tarOut.closeArchiveEntry()
                }
            }
        }
        
        return outputStream.toByteArray()
    }
    
    fun decompressTarGz(compressedData: ByteArray): Pair<String, ByteArray> {
        GzipCompressorInputStream(ByteArrayInputStream(compressedData)).use { gzipIn ->
            TarArchiveInputStream(gzipIn).use { tarIn ->
                val entry = tarIn.nextTarEntry
                if (entry != null) {
                    val outputStream = ByteArrayOutputStream()
                    tarIn.copyTo(outputStream)
                    return Pair(entry.name, outputStream.toByteArray())
                }
            }
        }
        throw IllegalArgumentException("No entries found in TAR.GZ file")
    }
    
    fun decompressRar(compressedData: ByteArray): Pair<String, ByteArray> {
        val tempFile = File.createTempFile("temp_rar_", ".rar")
        try {
            tempFile.writeBytes(compressedData)
            
            Archive(tempFile).use { archive ->
                val fileHeader: FileHeader = archive.fileHeaders.firstOrNull()
                    ?: throw IllegalArgumentException("No files found in RAR archive")
                
                val outputStream = ByteArrayOutputStream()
                archive.extractFile(fileHeader, outputStream)
                
                return Pair(fileHeader.fileName, outputStream.toByteArray())
            }
        } finally {
            tempFile.delete()
        }
    }
    
    fun getCompressionStats(originalSize: Long, compressedSize: Long): CompressionResult {
        val ratio = if (originalSize > 0) {
            ((originalSize - compressedSize).toDouble() / originalSize.toDouble()) * 100
        } else {
            0.0
        }
        
        return CompressionResult(
            success = true,
            originalSize = originalSize,
            compressedSize = compressedSize,
            compressionRatio = ratio,
            message = "Compression successful. Saved ${String.format("%.2f", ratio)}% of space."
        )
    }
}