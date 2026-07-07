import LegalLayout from '@/layouts/site/legal-layout';
import { LegalSection, LegalSidebar } from '@/pages/site/components/legal-sidebar';
import { Head } from '@inertiajs/react';

const sections: LegalSection[] = [
    { id: 'papeis', title: '1. Papéis na LGPD' },
    { id: 'coleta', title: '2. Dados tratados' },
    { id: 'finalidades', title: '3. Finalidades e bases' },
    { id: 'compartilhamento', title: '4. Compartilhamento' },
    { id: 'transferencia', title: '5. Transferência internacional' },
    { id: 'retencao', title: '6. Retenção' },
    { id: 'seguranca', title: '7. Segurança' },
    { id: 'direitos', title: '8. Direitos do titular' },
    { id: 'cookies', title: '9. Cookies' },
    { id: 'criancas', title: '10. Crianças e adolescentes' },
    { id: 'alteracoes', title: '11. Alterações' },
    { id: 'contato', title: '12. Contato' },
];

export default function Privacy() {
    return (
        <LegalLayout>
            <Head title="Política de Privacidade">
                <meta name="description" content="Política de Privacidade e proteção de dados pessoais do VetorPet." />
            </Head>
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-[240px_1fr]">
                <LegalSidebar sections={sections} />
                <article className="max-w-[76ch] text-[15px] leading-7 text-muted-foreground [&_h2]:scroll-mt-28 [&_h2]:border-b [&_h2]:border-border [&_h2]:pb-2 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-foreground [&_li]:ml-5 [&_li]:list-disc [&_p]:mb-5 [&_ul]:mb-6 [&_ul]:space-y-2">
                    <h1 className="mb-5 text-3xl font-semibold tracking-tight text-foreground">Política de Privacidade — VetorPet</h1>
                    <p className="mb-10 text-sm">Última atualização: 7 de julho de 2026</p>
                    <p>
                        Esta Política explica como o VetorPet trata dados pessoais em seu site, painel web e aplicativo Android, em conformidade com a
                        Lei nº 13.709/2018 — Lei Geral de Proteção de Dados Pessoais (LGPD).
                    </p>

                    <h2 id="papeis" className="mt-14 mb-5">
                        1. Papéis do VetorPet e do cliente
                    </h2>
                    <p>
                        O VetorPet atua como controlador dos dados necessários para cadastro, contratação, cobrança, suporte, segurança e
                        relacionamento com seus próprios usuários.
                    </p>
                    <p>
                        Para dados de clientes finais, contatos e colaboradores inseridos pela empresa assinante, essa empresa normalmente define as
                        finalidades e atua como controladora, enquanto o VetorPet atua como operador para prestar o serviço contratado.
                    </p>

                    <h2 id="coleta" className="mt-14 mb-5">
                        2. Dados pessoais tratados
                    </h2>
                    <ul>
                        <li>Cadastro e contato: nome, e-mail, telefone, empresa, CNPJ e credenciais protegidas;</li>
                        <li>equipe: perfil, função, regiões e permissões;</li>
                        <li>
                            operação comercial: contatos de pet shops e clínicas, visitas, pedidos, produtos, condições comerciais, comissões,
                            campanhas e regiões usadas para segmentação;
                        </li>
                        <li>localização: latitude e longitude opcionais no check-in e check-out de visitas, quando autorizadas no dispositivo;</li>
                        <li>
                            assinatura: plano, período, situação e identificadores de pagamento; dados financeiros completos permanecem com o provedor
                            de pagamento;
                        </li>
                        <li>dados técnicos: IP, dispositivo, sistema operacional, data e hora de acesso, logs de segurança e falhas.</li>
                    </ul>

                    <h2 id="finalidades" className="mt-14 mb-5">
                        3. Finalidades e bases legais
                    </h2>
                    <p>
                        Tratamos dados para criar e autenticar contas, executar o contrato, sincronizar web e aplicativo, processar assinaturas,
                        prestar suporte, exibir campanhas conforme a região do usuário, produzir indicadores e sugestões de inteligência comercial,
                        proteger a plataforma, prevenir fraude, cumprir obrigações legais e melhorar o serviço.
                    </p>
                    <p>
                        Conforme o contexto, utilizamos as bases legais de execução de contrato, cumprimento de obrigação legal ou regulatória,
                        exercício regular de direitos, legítimo interesse e consentimento quando exigido.
                    </p>

                    <h2 id="compartilhamento" className="mt-14 mb-5">
                        4. Compartilhamento de dados
                    </h2>
                    <p>
                        O VetorPet não vende dados pessoais. O compartilhamento pode ocorrer com provedores necessários de hospedagem, banco de dados,
                        e-mail, suporte, monitoramento e pagamento, além de autoridades públicas quando houver obrigação legal ou ordem válida.
                    </p>
                    <p>O Mercado Pago trata dados de pagamento conforme seus próprios termos e política de privacidade.</p>

                    <h2 id="transferencia" className="mt-14 mb-5">
                        5. Transferência internacional
                    </h2>
                    <p>
                        Alguns provedores tecnológicos podem armazenar ou processar dados fora do Brasil. Nesses casos, buscamos fornecedores com
                        medidas contratuais e de segurança compatíveis com a LGPD e a regulamentação aplicável.
                    </p>

                    <h2 id="retencao" className="mt-14 mb-5">
                        6. Retenção e eliminação
                    </h2>
                    <p>
                        Os dados são mantidos enquanto a conta estiver ativa e pelo período necessário para prestação do serviço, obrigações legais,
                        prevenção a fraude, resolução de disputas e exercício de direitos. Backups podem conservar cópias por prazo técnico limitado
                        antes da eliminação definitiva.
                    </p>

                    <h2 id="seguranca" className="mt-14 mb-5">
                        7. Segurança
                    </h2>
                    <p>
                        Adotamos controles de autenticação, segregação por empresa, restrição por perfil, criptografia de credenciais, registros
                        técnicos e outras medidas razoáveis para reduzir riscos de acesso não autorizado, perda, alteração ou divulgação.
                    </p>
                    <p>
                        Nenhum sistema é completamente imune a incidentes. Ocorrências relevantes serão tratadas conforme a legislação e as
                        orientações da autoridade competente.
                    </p>

                    <h2 id="direitos" className="mt-14 mb-5">
                        8. Direitos dos titulares
                    </h2>
                    <p>Nos termos da LGPD, o titular pode solicitar, quando aplicável:</p>
                    <ul>
                        <li>confirmação e acesso aos dados;</li>
                        <li>correção de dados incompletos, inexatos ou desatualizados;</li>
                        <li>anonimização, bloqueio ou eliminação de dados desnecessários ou tratados em desconformidade;</li>
                        <li>portabilidade, observadas a regulamentação e os segredos comercial e industrial;</li>
                        <li>informações sobre compartilhamento;</li>
                        <li>eliminação de dados tratados com consentimento e revogação do consentimento;</li>
                        <li>revisão de decisões exclusivamente automatizadas que afetem seus interesses.</li>
                    </ul>
                    <p>
                        Podemos solicitar informações para confirmar a identidade do requerente. Quando o pedido envolver dados controlados por uma
                        empresa assinante, auxiliaremos essa empresa no atendimento.
                    </p>

                    <h2 id="cookies" className="mt-14 mb-5">
                        9. Cookies e armazenamento local
                    </h2>
                    <p>
                        O site utiliza cookies estritamente necessários para sessão, segurança e funcionamento, além de preferências como aparência e
                        estado do menu. Atualmente não utilizamos cookies publicitários. Caso ferramentas opcionais de análise ou marketing sejam
                        adotadas, esta Política e os controles de consentimento serão atualizados.
                    </p>
                    <p>
                        O aplicativo utiliza armazenamento seguro no dispositivo para manter o token de autenticação. O usuário pode encerrar a sessão
                        para removê-lo.
                    </p>
                    <p>
                        Catálogos de campanhas podem ser acessados sem login por um endereço público criado pela plataforma. Essas páginas podem
                        exibir nome e objetivo da campanha, nome, logo e WhatsApp da empresa, além de imagem, referência, nome, descrição e preço dos
                        produtos selecionados. O endereço não deve ser usado para publicar dados pessoais ou informações confidenciais e deixa de
                        apresentar a campanha quando ela é desativada ou está fora do período configurado.
                    </p>

                    <h2 id="criancas" className="mt-14 mb-5">
                        10. Crianças e adolescentes
                    </h2>
                    <p>
                        O VetorPet é destinado a empresas e profissionais, não sendo direcionado a crianças ou adolescentes. Não solicitamos
                        intencionalmente dados desse público para criação de contas.
                    </p>

                    <h2 id="alteracoes" className="mt-14 mb-5">
                        11. Alterações nesta Política
                    </h2>
                    <p>
                        Esta Política pode ser atualizada para refletir mudanças legais, técnicas ou operacionais. A data da versão vigente será
                        indicada no início desta página.
                    </p>

                    <h2 id="contato" className="mt-14 mb-5">
                        12. Contato e exercício de direitos
                    </h2>
                    <p>
                        Solicitações relacionadas a privacidade e proteção de dados podem ser enviadas para{' '}
                        <a href="mailto:contato@vetorpet.com.br" className="text-primary hover:underline">
                            contato@vetorpet.com.br
                        </a>
                        .
                    </p>
                </article>
            </div>
        </LegalLayout>
    );
}
