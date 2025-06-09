#!/bin/bash

echo "🚀 Building Canteen Management Frontend for Plesk Deployment..."

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf dist plesk-dist

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install --legacy-peer-deps
fi

# Build the React application
echo "🔨 Building React application..."
npm run build:production

# Verify build was successful
if [ ! -d "dist" ]; then
    echo "❌ Build failed - dist directory not found"
    exit 1
fi

# Create Plesk deployment directory
echo "📁 Creating Plesk deployment structure..."
mkdir -p plesk-dist

# Copy built React app
echo "📋 Copying built application..."
cp -r dist/* plesk-dist/

# Copy server files for Node.js support
echo "🖥️ Setting up Node.js server..."
cp server.js plesk-dist/
cp app.js plesk-dist/

# Create production package.json
echo "📄 Creating production package.json..."
cat > plesk-dist/package.json << 'EOF'
{
  "name": "canteen-management-frontend",
  "version": "1.0.0",
  "type": "module",
  "main": "app.js",
  "scripts": {
    "start": "node app.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "compression": "^1.7.4",
    "helmet": "^7.1.0",
    "cors": "^2.8.5"
  }
}
EOF

# Create .htaccess for proper MIME types and routing
echo "⚙️ Creating .htaccess configuration..."
cat > plesk-dist/.htaccess << 'EOF'
# Enable CORS
<IfModule mod_headers.c>
    Header set Access-Control-Allow-Origin "*"
    Header set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
    Header set Access-Control-Allow-Headers "Origin, X-Requested-With, Content-Type, Accept, Authorization"
</IfModule>

# Proper MIME types for JavaScript modules and JSON
<IfModule mod_mime.c>
    AddType application/javascript .js
    AddType application/javascript .mjs
    AddType text/javascript .js .mjs
    AddType application/json .json
    AddType application/manifest+json .webmanifest
    AddType text/css .css
    AddType image/svg+xml .svg
    AddType image/webp .webp
</IfModule>

# Serve correct MIME types with headers
<IfModule mod_headers.c>
    <FilesMatch "\.js$">
        Header set Content-Type "application/javascript; charset=UTF-8"
    </FilesMatch>
    <FilesMatch "\.mjs$">
        Header set Content-Type "application/javascript; charset=UTF-8"
    </FilesMatch>
    <FilesMatch "\.css$">
        Header set Content-Type "text/css; charset=UTF-8"
    </FilesMatch>
    <FilesMatch "\.webmanifest$">
        Header set Content-Type "application/manifest+json; charset=UTF-8"
    </FilesMatch>
    <FilesMatch "\.json$">
        Header set Content-Type "application/json; charset=UTF-8"
    </FilesMatch>
</IfModule>

# Handle SPA routing - redirect all non-file requests to index.html
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /
    
    # Handle Node.js app (if using hybrid approach)
    RewriteCond %{REQUEST_URI} ^/(health|api)
    RewriteRule ^(.*)$ - [L]
    
    # If the request is for a file that exists, serve it directly
    RewriteCond %{REQUEST_FILENAME} -f
    RewriteRule ^(.*)$ - [L]
    
    # If the request is for a directory that exists, serve it directly
    RewriteCond %{REQUEST_FILENAME} -d
    RewriteRule ^(.*)$ - [L]
    
    # For all other requests, serve index.html (SPA routing)
    RewriteRule ^(.*)$ index.html [L]
</IfModule>

# Caching rules for performance
<IfModule mod_expires.c>
    ExpiresActive On
    
    # Cache static assets for 1 year
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/svg+xml "access plus 1 year"
    ExpiresByType image/webp "access plus 1 year"
    ExpiresByType image/ico "access plus 1 year"
    
    # Cache fonts for 1 year
    ExpiresByType font/ttf "access plus 1 year"
    ExpiresByType font/otf "access plus 1 year"
    ExpiresByType font/woff "access plus 1 year"
    ExpiresByType font/woff2 "access plus 1 year"
    
    # Cache CSS and JavaScript for 1 month
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
    ExpiresByType text/javascript "access plus 1 month"
    
    # Cache manifest for 1 day
    ExpiresByType application/manifest+json "access plus 1 day"
    
    # Cache HTML for 1 hour
    ExpiresByType text/html "access plus 1 hour"
</IfModule>

# Compression for better performance
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
    AddOutputFilterByType DEFLATE application/json
    AddOutputFilterByType DEFLATE application/manifest+json
</IfModule>
EOF

# Create environment configuration
echo "🌍 Creating environment configuration..."
cat > plesk-dist/.env << 'EOF'
NODE_ENV=production
PORT=3000
VITE_API_BASE_URL=https://canteenapi.gerizimheights.org
CORS_ORIGIN=https://canteen.gerizimheights.org
EOF

# Verify critical files exist
echo "✅ Verifying build integrity..."
critical_files=("index.html" "app.js" "server.js" "package.json" ".htaccess")
for file in "${critical_files[@]}"; do
    if [ ! -f "plesk-dist/$file" ]; then
        echo "❌ Critical file missing: $file"
        exit 1
    fi
done

# Check if assets directory exists
if [ ! -d "plesk-dist/assets" ]; then
    echo "⚠️ Warning: assets directory not found - this might cause loading issues"
fi

echo "✅ Build completed successfully!"
echo "📦 Deployment files are ready in: plesk-dist/"
echo ""
echo "📋 Next steps:"
echo "1. Upload the contents of plesk-dist/ to your Plesk domain root"
echo "2. Configure Node.js settings in Plesk (see PLESK-DEPLOYMENT-GUIDE.md)"
echo "3. Run 'npm install' in Plesk Node.js commands"
echo "4. Restart the application"
