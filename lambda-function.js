exports.handler = async (event) => {
    const body = JSON.parse(event.body || '{}');
    
    // Handle different webhook types
    if (body.event === 'form-submit') {
        return await handleFormSubmit(body.data);
    } else if (body.event === 'image-upload') {
        return await handleImageUpload(body.data);
    } else if (body.event === 'page-view') {
        return await trackPageView(body.data);
    } else if (body.event === 'rss-fetch') {
        return await fetchRSSFeed(body.data);
    } else {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Unknown event type' })
        };
    }
};

async function handleFormSubmit(data) {
    // Store form data in S3 or DynamoDB
    console.log('Form submitted:', data);
    return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Form received', timestamp: new Date().toISOString() })
    };
}

async function handleImageUpload(data) {
    // Process image: resize, optimize, add metadata
    console.log('Image uploaded:', data);
    return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Image processed', url: data.url })
    };
}

async function trackPageView(data) {
    // Send to CloudWatch or analytics service
    console.log('Page view tracked:', data);
    return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Event tracked' })
    };
}

async function fetchRSSFeed(url) {
    // Fetch and parse RSS feeds
    try {
        const response = await fetch(url);
        const xml = await response.text();
        return {
            statusCode: 200,
            body: JSON.stringify({ feed: xml })
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to fetch RSS' })
        };
    }
}
