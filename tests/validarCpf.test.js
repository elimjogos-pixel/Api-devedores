const validarCpf = require('../src/utils/validarCpf');

describe('Testes da função validarCpf', () => {

    test('Deve aceitar um CPF válido', () => {
        expect(validarCpf('529.982.247-25')).toBe(true);
    });

    test('Deve aceitar CPF válido sem formatação', () => {
        expect(validarCpf('52998224725')).toBe(true);
    });

    test('Deve rejeitar CPF com menos de 11 dígitos', () => {
        expect(validarCpf('123456789')).toBe(false);
    });

    test('Deve rejeitar CPF com mais de 11 dígitos', () => {
        expect(validarCpf('123456789012')).toBe(false);
    });

    test('Deve rejeitar CPF com todos os números iguais', () => {
        expect(validarCpf('11111111111')).toBe(false);
    });

    test('Deve rejeitar CPF com primeiro dígito verificador incorreto', () => {
        expect(validarCpf('52998224735')).toBe(false);
    });

    test('Deve rejeitar CPF com segundo dígito verificador incorreto', () => {
        expect(validarCpf('52998224724')).toBe(false);
    });

    test('Deve aceitar CPF quando o primeiro resto for 10', () => {
        expect(validarCpf('12345678909')).toBe(true);
    });
    
    test('Deve aceirtar o CPF quando o segundo resto for 10', () => {
        expect(validarCpf('12345679620')).toBe(true);
    });

});