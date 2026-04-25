type CepResult = {
  street: string;
  district: string;
  city: string;
  state: string;
};

export function formatCep(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

export async function fetchAddressByCep(cep: string): Promise<CepResult | null> {
  const cleanCep = cep.replace(/\D/g, '');
  if (cleanCep.length !== 8) return null;

  try {
    const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
    if (!response.ok) return null;

    const data = await response.json();
    if (data?.erro) return null;

    return {
      street: data.logradouro ?? '',
      district: data.bairro ?? '',
      city: data.localidade ?? '',
      state: data.uf ?? '',
    };
  } catch {
    return null;
  }
}
