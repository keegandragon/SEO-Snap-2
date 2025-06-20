const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': '*',
  'Content-Type': 'application/json'
};

interface ProductDescription {
  id: string;
  title: string;
  text: string;
  keywords: string[];
  seoMetadata: {
    title: string;
    description: string;
    tags: string[];
  };
}

async function sendEmail(email: string, description: ProductDescription) {
  // For now, we'll use a simple email service like Resend
  // You can also use SendGrid, Mailgun, or other services
  const resendApiKey = Deno.env.get('RESEND_API_KEY');
  
  if (!resendApiKey) {
    throw new Error('Email service not configured. Please add RESEND_API_KEY to your Supabase Edge Function environment variables.');
  }

  const emailContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Your SEO Snap Product Description</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #1e40af; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .title { color: #1e40af; font-size: 24px; margin-bottom: 15px; }
        .description { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #1e40af; }
        .tags { margin: 20px 0; }
        .tag { display: inline-block; background: #dbeafe; color: #1e40af; padding: 4px 8px; margin: 2px; border-radius: 4px; font-size: 12px; }
        .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
        .seo-section { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; }
        .seo-title { font-weight: bold; color: #374151; margin-bottom: 10px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>📸 SEO Snap</h1>
        <p>Your AI-Generated Product Description</p>
    </div>
    
    <div class="content">
        <h2 class="title">${description.title}</h2>
        
        <div class="description">
            <h3>Product Description:</h3>
            <p>${description.text.replace(/\n/g, '<br>')}</p>
        </div>
        
        <div class="seo-section">
            <div class="seo-title">SEO Title:</div>
            <p>${description.seoMetadata.title}</p>
            
            <div class="seo-title">Meta Description:</div>
            <p>${description.seoMetadata.description}</p>
            
            <div class="seo-title">SEO Tags:</div>
            <div class="tags">
                ${description.seoMetadata.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
        </div>
        
        <div class="tags">
            <strong>Keywords:</strong><br>
            ${description.keywords.map(keyword => `<span class="tag">${keyword}</span>`).join('')}
        </div>
    </div>
    
    <div class="footer">
        <p>Generated by SEO Snap - AI-Powered Product Descriptions</p>
        <p>Visit us at <a href="https://seosnap.com">seosnap.com</a></p>
    </div>
</body>
</html>
  `;

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'SEO Snap <your-email@seosnap.com>',
      to: [email],
      subject: `Your Product Description: ${description.title}`,
      html: emailContent,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Email service error: ${response.status} - ${errorText}`);
  }

  const result = await response.json();
  return result;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }

  try {
    console.log('Received request to send email');

    // Parse the request body
    const body = await req.json();
    const { email, description } = body;

    if (!email) {
      return new Response(
        JSON.stringify({ 
          error: 'Email address is required',
          success: false
        }),
        {
          status: 400,
          headers: corsHeaders
        }
      );
    }

    if (!description) {
      return new Response(
        JSON.stringify({ 
          error: 'Product description is required',
          success: false
        }),
        {
          status: 400,
          headers: corsHeaders
        }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid email address format',
          success: false
        }),
        {
          status: 400,
          headers: corsHeaders
        }
      );
    }

    console.log('Sending email to:', email);
    await sendEmail(email, description);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Email sent successfully'
      }),
      {
        headers: corsHeaders
      }
    );

  } catch (error) {
    console.error('Error in send-email function:', error);

    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to send email',
        success: false,
        details: 'Please ensure your email service is properly configured in Supabase Edge Function environment variables.'
      }),
      {
        status: 500,
        headers: corsHeaders
      }
    );
  }
});