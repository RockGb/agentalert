plugins {
    id("java")
    id("org.jetbrains.intellij") version "1.13.3"
    id("org.jetbrains.kotlin.jvm") version "1.8.21"
}

group = "com.agentdone"
version = "1.0-SNAPSHOT"

repositories {
    mavenCentral()
}

dependencies {
    implementation("org.jetbrains.kotlin:kotlin-stdlib:1.8.21")
}

intellij {
    version.set("2022.3")
    type.set("IC") // IntelliJ IDEA Community Edition
    plugins.set(listOf("com.intellij.java"))
}

tasks {
    withType<org.jetbrains.kotlin.gradle.tasks.KotlinCompile> {
        kotlinOptions.jvmTarget = "17"
    }

    patchPluginXml {
        changeNotes.set("Initial release with core service connection.")
    }

    signPlugin {
        certificateChain.set(System.getenv("CERTIFICATE_CHAIN"))
        privateKey.set(System.getenv("PRIVATE_KEY"))
        password.set(System.getenv("PRIVATE_KEY_PASSWORD"))
    }

    publishPlugin {
        token.set(System.getenv("PUBLISH_TOKEN"))
    }
}
