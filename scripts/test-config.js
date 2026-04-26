#!/usr/bin/env node

// Script para testar as configurações de email
const { createClient } = require('@supabase/supabase-js');
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

async function testConfig() {
  console.log('🔍 Testando configurações...\n');

  // Testar variáveis de ambiente
  const envVars = {
    'SUPABASE_URL': process.env.SUPABASE_URL,
    'SUPABASE_SERVICE_ROLE_KEY': process.env.SUPABASE_SERVICE_ROLE_KEY ? '[CONFIGURADA]' : '[FALTANDO]',
    'RESEND_API_KEY': process.env.RESEND_API_KEY ? '[CONFIGURADA]' : '[FALTANDO]',
    'RESEND_FROM_EMAIL': process.env.RESEND_FROM_EMAIL,
  };

  console.log('📋 Variáveis de ambiente:');
  Object.entries(envVars).forEach(([key, value]) => {
    console.log(`  ${key}: ${value}`);
  });
  console.log();

  // Testar conexão com Supabase
  if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      console.log('🔗 Testando conexão com Supabase...');
      const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

      const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1 });

      if (error) {
        console.log('❌ Erro na conexão com Supabase:', error.message);
      } else {
        console.log('✅ Conexão com Supabase OK');
      }
    } catch (err) {
      console.log('❌ Erro ao testar Supabase:', err.message);
    }
  } else {
    console.log('❌ Configuração do Supabase incompleta');
  }

  // Testar Resend
  if (process.env.RESEND_API_KEY) {
    try {
      console.log('📧 Testando conexão com Resend...');
      const response = await fetch('https://api.resend.com/domains', {
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        },
      });

      if (response.ok) {
        console.log('✅ Conexão com Resend OK');
      } else {
        console.log('❌ Erro na conexão com Resend:', response.status, response.statusText);
      }
    } catch (err) {
      console.log('❌ Erro ao testar Resend:', err.message);
    }
  } else {
    console.log('❌ RESEND_API_KEY não configurada');
  }

  console.log('\n✨ Teste concluído!');
}

testConfig().catch(console.error);