use aws_sdk_s3::Client;
use aws_sdk_s3::presigning::PresigningConfig;
use std::time::Duration;

/// Generate a presigned PUT URL for uploading a file to R2.
/// The URL expires after `expiry_secs` seconds.
pub async fn presign_put(
    client: &Client,
    bucket: &str,
    key: &str,
    content_type: &str,
    expiry_secs: u64,
) -> Result<String, aws_sdk_s3::error::SdkError<aws_sdk_s3::operation::put_object::PutObjectError>>
{
    let presigning_config = PresigningConfig::builder()
        .expires_in(Duration::from_secs(expiry_secs))
        .build()
        .expect("valid presigning config");

    let presigned = client
        .put_object()
        .bucket(bucket)
        .key(key)
        .content_type(content_type)
        .presigned(presigning_config)
        .await?;

    Ok(presigned.uri().to_string())
}

/// Delete an object from R2.
pub async fn delete_object(
    client: &Client,
    bucket: &str,
    key: &str,
) -> Result<(), aws_sdk_s3::error::SdkError<aws_sdk_s3::operation::delete_object::DeleteObjectError>>
{
    client
        .delete_object()
        .bucket(bucket)
        .key(key)
        .send()
        .await?;
    Ok(())
}
