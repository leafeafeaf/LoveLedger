package com.ssafy.loveledger.global.util;

import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.S3Exception;

@Component
@RequiredArgsConstructor
public class ImageUploadUtil {

    private final S3Client s3Client;

    @Value("${cloud.aws.s3.bucket}")
    private String bucketName;

    @Transactional
    public String uploadImage(MultipartFile image, String dirName) {
        String fileName = UUID.randomUUID() + ".png";
        PutObjectRequest request = PutObjectRequest.builder()
            .bucket(bucketName)
            .key(dirName + "/" + fileName)
            .metadata(Map.of(
                "Content-Type", "image/png",
                "Content-Length", String.valueOf(image.getSize())
            ))
            .build();

        try (InputStream inputStream = image.getInputStream()) {
            s3Client.putObject(request, RequestBody.fromInputStream(inputStream, image.getSize()));
        } catch (IOException | S3Exception e) {
            e.printStackTrace();
        }

        return s3Client.utilities()
            .getUrl(builder -> builder.bucket(bucketName).key(dirName + "/" + fileName)).toString();
    }

    public void deleteImage(String fileKey) {
        try {
            s3Client.deleteObject(DeleteObjectRequest.builder()
                .bucket(bucketName)
                .key(fileKey)
                .build());
        } catch (S3Exception e) {
            e.printStackTrace();
        }
    }

    // 여러 파일 삭제
    public void deleteImages(List<String> files) {
        for (String file : files) {
            deleteImage(extractFileKeyFromUrl(file));
        }
    }

    private String extractFileKeyFromUrl(String imageUrl) {
        int index_counter = 61;
        return imageUrl.substring(imageUrl.indexOf("s3.amazonaws.com/") + index_counter);
    }
}
