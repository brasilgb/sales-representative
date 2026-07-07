import LegalLayout from '@/layouts/site/legal-layout';
import { LegalSection, LegalSidebar } from '@/pages/site/components/legal-sidebar';
import { Head } from '@inertiajs/react';

const sections: LegalSection[] = [
    { id: 'servico', title: '1. Serviço' },
    { id: 'conta', title: '2. Conta e acesso' },
    { id: 'dados', title: '3. Dados inseridos' },
    { id: 'uso', title: '4. Uso permitido' },
    { id: 'assinatura', title: '5. Assinatura e pagamento' },
    { id: 'operacao', title: '6. Operação comercial' },
    { id: 'disponibilidade', title: '7. Disponibilidade' },
    { id: 'propriedade', title: '8. Propriedade intelectual' },
    { id: 'cancelamento', title: '9. Suspensão e cancelamento' },
    { id: 'responsabilidade', title: '10. Responsabilidade' },
    { id: 'alteracoes', title: '11. Alterações' },
    { id: 'legislacao', title: '12. Legislação e contato' },
];

export default function Terms() {
    return (
        <LegalLayout>
            <Head title="Termos de Uso">
                <meta name="description" content="Termos de Uso da plataforma VetorPet." />
            </Head>
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-[240px_1fr]">
                <LegalSidebar sections={sections} />
                <article className="max-w-[76ch] text-[15px] leading-7 text-muted-foreground [&_h2]:scroll-mt-28 [&_h2]:border-b [&_h2]:border-border [&_h2]:pb-2 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-foreground [&_li]:ml-5 [&_li]:list-disc [&_p]:mb-5 [&_ul]:mb-6 [&_ul]:space-y-2">
                    <h1 className="mb-5 text-3xl font-semibold tracking-tight text-foreground">Termos de Uso — VetorPet</h1>
                    <p className="mb-10 text-sm">Última atualização: 7 de julho de 2026</p>
                    <p>
                        Estes Termos regulam o acesso à plataforma VetorPet. Ao criar uma conta ou utilizar o serviço, o usuário declara ter
                        capacidade para contratar e concordar com estas condições.
                    </p>

                    <h2 id="servico" className="mt-14 mb-5">
                        1. Descrição do serviço
                    </h2>
                    <p>
                        O VetorPet é um software como serviço para distribuidores, representantes e equipes que vendem suprimentos a pet shops,
                        clínicas veterinárias e estabelecimentos relacionados.
                    </p>
                    <ul>
                        <li>Gestão de clientes, regiões e vendedores;</li>
                        <li>catálogo, estoque de referência e condições comerciais;</li>
                        <li>agenda e registro de visitas;</li>
                        <li>emissão e acompanhamento de pedidos;</li>
                        <li>campanhas segmentadas, catálogos públicos e inteligência comercial;</li>
                        <li>painéis, relatórios e comissões comerciais.</li>
                    </ul>

                    <h2 id="conta" className="mt-14 mb-5">
                        2. Cadastro de conta e acesso
                    </h2>
                    <p>
                        As informações de cadastro devem ser verdadeiras, completas e atualizadas. O titular da conta é responsável por administrar
                        usuários, perfis, regiões e permissões da sua equipe.
                    </p>
                    <p>
                        Credenciais são pessoais e não devem ser compartilhadas. O usuário deve comunicar imediatamente qualquer suspeita de acesso
                        indevido.
                    </p>

                    <h2 id="dados" className="mt-14 mb-5">
                        3. Dados inseridos pelo cliente
                    </h2>
                    <p>
                        O cliente mantém a titularidade e a responsabilidade pelos dados que insere, incluindo informações de sua empresa, equipe,
                        clientes, contatos, produtos, preços, visitas, pedidos e campanhas.
                    </p>
                    <p>
                        O cliente declara possuir base legal para tratar e inserir dados pessoais de terceiros. Quando tratar esses dados em nome do
                        cliente, o VetorPet atuará como operador, conforme detalhado na Política de Privacidade.
                    </p>

                    <h2 id="uso" className="mt-14 mb-5">
                        4. Uso permitido
                    </h2>
                    <p>
                        É proibido utilizar a plataforma para atividades ilegais, conteúdo malicioso, fraude, violação de direitos, tentativa de
                        acesso não autorizado, engenharia reversa indevida ou interferência na segurança e disponibilidade do serviço.
                    </p>

                    <h2 id="assinatura" className="mt-14 mb-5">
                        5. Teste, assinatura e pagamento
                    </h2>
                    <p>
                        Planos, períodos, preços e duração do teste são os exibidos no momento da contratação. A continuidade após o teste depende da
                        ativação e do pagamento da assinatura.
                    </p>
                    <p>
                        Pagamentos podem ser processados por parceiros, como o Mercado Pago, sujeitos também aos termos e políticas desses provedores.
                        Inadimplência, expiração ou contestação de pagamento podem limitar o acesso até a regularização.
                    </p>

                    <h2 id="operacao" className="mt-14 mb-5">
                        6. Pedidos e decisões comerciais
                    </h2>
                    <p>
                        O VetorPet apoia a operação comercial, mas não substitui sistemas fiscais, contábeis, logísticos ou ERP. O cliente é
                        responsável por validar preços, estoques, descontos, tributos, documentos fiscais, entrega e demais obrigações da venda.
                    </p>
                    <p>
                        Indicadores, sugestões e cálculos de comissão dependem dos dados e regras configurados pelo cliente e devem ser conferidos
                        antes de decisões financeiras.
                    </p>
                    <p>
                        Campanhas podem ser direcionadas a todos os clientes ou a uma região e disponibilizadas por um endereço público contendo o
                        nome e o objetivo da campanha, identificação e contato da empresa e informações dos produtos selecionados. O cliente é
                        responsável por definir o público, revisar o conteúdo e compartilhar esse endereço somente pelos canais e com as pessoas
                        pretendidas. Enquanto a campanha estiver ativa e dentro do período configurado, qualquer pessoa que possua o endereço poderá
                        visualizar o catálogo sem autenticação.
                    </p>
                    <p>
                        A empresa também pode compartilhar seu catálogo público permanente, independente de campanha, com identificação e contato da
                        empresa, referências, descrições, imagens e preços dos produtos disponíveis. Qualquer pessoa que possua o endereço poderá
                        visualizá-lo sem autenticação, cabendo ao cliente manter essas informações atualizadas e compartilhar o link pelos canais
                        pretendidos.
                    </p>

                    <h2 id="disponibilidade" className="mt-14 mb-5">
                        7. Disponibilidade e manutenção
                    </h2>
                    <p>
                        Empregamos esforços razoáveis para manter o serviço disponível e seguro. Poderão ocorrer interrupções por manutenção,
                        atualização, falha de infraestrutura, indisponibilidade de terceiros ou eventos fora de controle razoável.
                    </p>

                    <h2 id="propriedade" className="mt-14 mb-5">
                        8. Propriedade intelectual
                    </h2>
                    <p>
                        Software, marca, interfaces, documentação e demais elementos do VetorPet são protegidos por direitos de propriedade
                        intelectual. A assinatura concede apenas licença limitada, não exclusiva e intransferível durante a vigência do plano.
                    </p>

                    <h2 id="cancelamento" className="mt-14 mb-5">
                        9. Suspensão, cancelamento e dados
                    </h2>
                    <p>
                        A conta pode ser suspensa por violação destes Termos, risco de segurança, uso abusivo ou inadimplência. O cliente pode
                        solicitar cancelamento pelos canais de atendimento.
                    </p>
                    <p>
                        Após o encerramento, os dados poderão ser mantidos pelo período necessário para obrigações legais, prevenção a fraude,
                        exercício de direitos e rotinas técnicas de backup, conforme a Política de Privacidade.
                    </p>

                    <h2 id="responsabilidade" className="mt-14 mb-5">
                        10. Limitação de responsabilidade
                    </h2>
                    <p>
                        Na extensão permitida pela legislação, o VetorPet não responde por dados incorretos inseridos pelo cliente, decisões
                        comerciais tomadas com base nesses dados, falhas de terceiros, uso indevido de credenciais ou danos indiretos e lucros
                        cessantes.
                    </p>
                    <p>Nada nestes Termos exclui responsabilidades que não possam ser afastadas pela legislação aplicável.</p>

                    <h2 id="alteracoes" className="mt-14 mb-5">
                        11. Alterações nestes Termos
                    </h2>
                    <p>
                        Os Termos podem ser atualizados para refletir mudanças legais, técnicas ou comerciais. Alterações relevantes serão comunicadas
                        por meio adequado, e a versão vigente permanecerá disponível nesta página.
                    </p>

                    <h2 id="legislacao" className="mt-14 mb-5">
                        12. Legislação aplicável e contato
                    </h2>
                    <p>
                        Estes Termos são regidos pelas leis da República Federativa do Brasil. Questões serão tratadas preferencialmente de forma
                        amigável, sem prejuízo do foro legalmente competente.
                    </p>
                    <p>
                        Contato:{' '}
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
