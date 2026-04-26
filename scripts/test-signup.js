#!/usr/bin/env node

// Script para testar o endpoint de signup
const fs = require('fs');
const path = require('path');

// Carregar variáveis do .env.local
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      const value = valueParts.join('=').trim();
      if (value) {
        process.env[key.trim()] = value;
      }
    }
  });
}

const baseUrl = process.env.APP_URL || process.env.EXPO_PUBLIC_APP_URL || 'https://futlygo.com.br';

console.log('🔗 URL base sendo usada:', baseUrl);

async function testEndpoint(endpoint, method = 'GET', body = null) {
  try {
    console.log(`🌐 Testando ${endpoint}...`);

    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${baseUrl}${endpoint}`, options);
    console.log(`📥 Status: ${response.status}`);

    const responseText = await response.text();
    console.log('📄 Resposta:', responseText);

    if (responseText) {
      try {
        const json = JSON.parse(responseText);
        console.log('🔍 JSON:', JSON.stringify(json, null, 2));
        return json;
      } catch (e) {
        console.log('⚠️  Não é JSON válido');
      }
    }

    return null;
  } catch (error) {
    console.log('❌ Erro:', error.message);
    return null;
  }
}

async function testSignup() {
  console.log('🧪 Testando endpoints da API...\n');

  // Teste 1: Configuração
  console.log('1️⃣ Testando configuração:');
  const configResult = await testEndpoint('/api/config-check');
  console.log();

  // Teste 2: Email de teste
  console.log('2️⃣ Testando envio de email:');
  const emailResult = await testEndpoint('/api/test-email', 'POST', {});
  console.log();

  // Teste 3: Signup (se os anteriores passaram)
  if (configResult && configResult.hasSupabaseUrl && configResult.hasResendApiKey) {
    console.log('3️⃣ Testando signup:');
    const testData = {
      email: `test${Date.now()}@example.com`,
      password: 'TestPassword123',
      fullName: 'Test User',
      phone: '11999999999',
      state: 'SP',
      city: 'São Paulo',
      cep: '01234567',
    };

    console.log('📤 Dados de teste:', JSON.stringify(testData, null, 2));
    const signupResult = await testEndpoint('/api/auth-signup', 'POST', testData);
  } else {
    console.log('3️⃣ ⚠️  Pulando teste de signup - configurações básicas falharam');
  }
}

testSignup().catch(console.error);