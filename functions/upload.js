const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    let body;
    try {
      body = JSON.parse(event.body);
    } catch (jsonErr) {
      const contentType = event.headers['content-type'] || '';
      if (contentType.includes('multipart/form-data')) {
        const boundaryMatch = contentType.match(/boundary=([^;]+)/);
        const boundary = boundaryMatch ? boundaryMatch[1].trim() : null;
        if (boundary) {
          const parts = event.body.split('--' + boundary);
          for (const part of parts) {
            if (part.includes('Content-Disposition') && part.includes('name=')) {
              const dataMatch = part.match(/\r\n\r\n([\s\S]*?)(?:\r\n--|$)/);
              if (dataMatch) {
                const data = dataMatch[1].trim();
                try {
                  body = JSON.parse(data);
                  break;
                } catch (e) {}
              }
            }
          }
        }
      }
      if (!body) {
        throw new Error('Body non riconosciuto: ne JSON ne form-data valido');
      }
    }

    const { fileName, fileType, fileData, deviceInfo } = body;
    if (!fileName || !fileData) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Nome file e dati richiesti' }) };
    }

    const fileBuffer = Buffer.from(fileData, 'base64');
    const userId = 'patrizio.zanirato@gmail.com';
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'Configurazione server mancante' }) };
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    const timestamp = Date.now();
    const safeFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = userId + '/' + timestamp + '_' + safeFileName;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('pwa-files')
      .upload(filePath, fileBuffer, {
        contentType: fileType || 'application/octet-stream',
        upsert: false
      });

    if (uploadError) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'Upload fallito: ' + uploadError.message }) };
    }

    const { data: { publicUrl } } = supabase.storage
      .from('pwa-files')
      .getPublicUrl(filePath);

    const { data: dbData, error: dbError } = await supabase
      .from('pwa_files')
      .insert({
        user_id: userId,
        file_name: fileName,
        file_path: filePath,
        file_size: fileBuffer.length,
        file_type: fileType,
        public_url: publicUrl,
        device_info: deviceInfo || 'unknown',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (dbError) {
      console.error('DB error:', dbError);
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        fileId: dbData ? dbData.id : null,
        fileName: fileName,
        filePath: filePath,
        publicUrl: publicUrl,
        size: fileBuffer.length,
        message: 'File caricato con successo'
      })
    };

  } catch (error) {
    console.error('Errore:', error);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Errore interno: ' + error.message }) };
  }
};
