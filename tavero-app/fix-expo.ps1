Write-Host "LIMPIANDO PROYECTO EXPO..."

Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item -Force package-lock.json -ErrorAction SilentlyContinue
Remove-Item -Force yarn.lock -ErrorAction SilentlyContinue
Remove-Item -Force pnpm-lock.yaml -ErrorAction SilentlyContinue

Write-Host "LIMPIANDO CACHE NPM..."
npm cache clean --force

Write-Host "INSTALANDO EXPO..."
npm install expo@latest

Write-Host "INSTALANDO DEPENDENCIAS..."
npm install

Write-Host "SINCRONIZANDO EXPO SDK..."
npx expo install

Write-Host "INICIANDO EXPO..."
npx expo start -c --tunnel