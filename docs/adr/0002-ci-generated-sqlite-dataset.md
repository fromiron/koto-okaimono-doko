# CI-generated SQLite Dataset

Store data is generated in CI as raw SQLite plus a Dataset Manifest, and the app downloads a newer SQLite file only after checking the manifest. The full latest Dataset is also bundled as `seed.sqlite`, so the first launch is useful offline. Raw SQLite is preferred over compressed archives or an app backend because the Dataset is small, easy to verify with SHA-256, and can be swapped without introducing server operations.
