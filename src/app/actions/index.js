"use server";

// Function to validate and process image URL
const processImageUrl = (imageUrl) => {
  if (!imageUrl) return null;

  // Basic URL validation
  try {
    const url = new URL(imageUrl);

    // Check if it's a valid image URL
    const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"];
    const hasImageExtension = imageExtensions.some((ext) =>
      url.pathname.toLowerCase().includes(ext)
    );

    // Check if it's a direct image URL (not a search URL or webpage)
    const isDirectImage =
      hasImageExtension ||
      url.hostname.includes("imgur.com") ||
      url.hostname.includes("picsum.photos") ||
      url.hostname.includes("placehold.co") ||
      url.hostname.includes("via.placeholder.com") ||
      url.hostname.includes("loremflickr.com");

    // Reject search URLs and non-image URLs
    if (
      url.hostname.includes("google.com") &&
      url.pathname.includes("/search")
    ) {
      console.log("Rejected Google search URL:", imageUrl);
      return null;
    }

    if (isDirectImage) {
      return imageUrl;
    }

    console.log("URL doesn't appear to be a direct image:", imageUrl);
    return null;
  } catch (error) {
    console.log("Invalid image URL:", imageUrl);
    return null;
  }
};

// Function to generate image variations (placeholder for AI integration)
const generateImageVariations = async (imageUrl) => {
  try {
    // This is a placeholder for AI image generation
    // You can integrate with services like:
    // - OpenAI DALL-E API
    // - Stability AI
    // - Midjourney API
    // - Custom AI models

    console.log("Generating variations for:", imageUrl);

    // For now, return the original image with some metadata
    return {
      original: imageUrl,
      variations: [
        `${imageUrl}?variation=1`,
        `${imageUrl}?variation=2`,
        `${imageUrl}?variation=3`,
      ],
      generated: false, // Set to true when AI integration is added
    };
  } catch (error) {
    console.log("Error generating image variations:", error);
    return null;
  }
};

export const sendDiscordMessage = async (prevState, formData) => {
  try {
    const rawFormEntries = Object.fromEntries(formData);
    console.log(rawFormEntries);

    // Process the image URL
    const imageUrl = processImageUrl(rawFormEntries?.dp);

    // Generate image variations if URL is provided
    let imageData = null;
    if (imageUrl) {
      imageData = await generateImageVariations(imageUrl);
    }

    // Prepare Discord embed with image
    const embed = {
      fields: [
        {
          name: "Email",
          value: rawFormEntries?.email,
          inline: true,
        },
        {
          name: "Message Type",
          value: rawFormEntries?.type,
          inline: true,
        },
      ],
    };

    // Add image to embed if available
    if (imageUrl) {
      embed.image = {
        url: imageUrl,
      };
      embed.thumbnail = {
        url: imageUrl,
      };

      // Add image generation info if variations were created
      if (imageData && imageData.variations) {
        embed.fields.push({
          name: "Image Variations Generated",
          value: imageData.generated
            ? "✅ AI-generated variations available"
            : "📷 Original image processed",
          inline: false,
        });
      }
    }

    await fetch(process.env.DISCORD_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: rawFormEntries?.username,
        avatar_url: imageUrl || "https://i.imgur.com/mDKlggm.png",
        content: rawFormEntries?.message,
        embeds: [embed],
      }),
    });

    return {
      success: true,
      message: imageUrl
        ? `Your message with image has been sent successfully! ${
            imageData?.generated
              ? "AI variations generated."
              : "Image processed."
          }`
        : `Your message has been sent successfully.`,
    };
  } catch (err) {
    console.log(err.message);
    return {
      success: false,
      message: `Problem is sending message ${err.message}`,
    };
  }
};
