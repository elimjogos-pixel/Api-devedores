
function validarCpf(cpf) {
    // Remover pontos, traços e outros caracteres
    cpf = String(cpf).replace(/\D/g, '');

    // CPF precisa ter 11 dígitos
    if (cpf.length !== 11) {
        return false;
    }

    // Impedir CPFs com todos os números iguais
    if (/^(\d)\1{10}$/.test(cpf)) {
        return false;
    }

    // Calcular primeiro dígito verificador
    let soma = 0;

    for (let i = 0; i < 9; i++) {
        soma += Number(cpf[i]) * (10 - i);
    }

    let resto = (soma * 10) % 11;

    if (resto === 10) {
        resto = 0;
    }

    if (resto !== Number(cpf[9])) {
        return false;
    }

    // Calcular segundo dígito verificador
    soma = 0;

    for (let i = 0; i < 10; i++) {
        soma += Number(cpf[i]) * (11 - i);
    }

    resto = (soma * 10) % 11;

    if (resto === 10) {
        resto = 0;
    }

    return resto === Number(cpf[10]);
}

module.exports = validarCpf;