

cd frontend
npm install
npm run build
cd ..

Remove-Item -Recurse -Force backend\frontend_build -ErrorAction SilentlyContinue
Copy-Item -Recurse frontend\build backend\frontend_build
Copy-Item frontend\build\index.html backend\templates\

Write-Host "Build complete!"