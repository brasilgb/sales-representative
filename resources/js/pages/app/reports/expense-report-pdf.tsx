import { maskMoney } from '@/Utils/mask';
import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import moment from 'moment';

const categoryLabels: Record<string, string> = {
    mileage: 'Quilometragem',
    food: 'Alimentação',
    lodging: 'Hospedagem',
    other: 'Outros gastos',
};

const styles = StyleSheet.create({
    page: { padding: 28, fontSize: 8, color: '#111827' },
    title: { fontSize: 17, fontWeight: 'bold', textAlign: 'center' },
    subtitle: { marginTop: 5, fontSize: 9, textAlign: 'center', color: '#4b5563' },
    summary: { flexDirection: 'row', gap: 6, marginVertical: 16 },
    card: { flex: 1, borderWidth: 1, borderColor: '#d1d5db', padding: 7 },
    cardLabel: { color: '#6b7280' },
    cardValue: { marginTop: 4, fontSize: 10, fontWeight: 'bold' },
    sectionTitle: { marginTop: 4, marginBottom: 6, fontSize: 10, fontWeight: 'bold' },
    row: { flexDirection: 'row', borderBottom: '1 solid #d1d5db', minHeight: 24, alignItems: 'center' },
    header: { backgroundColor: '#f3f4f6', fontWeight: 'bold' },
    date: { width: '12%', padding: 4 },
    seller: { width: '19%', padding: 4 },
    category: { width: '15%', padding: 4 },
    details: { width: '30%', padding: 4 },
    amount: { width: '12%', padding: 4, textAlign: 'right' },
    km: { width: '12%', padding: 4, textAlign: 'right' },
    categoryName: { width: '40%', padding: 4 },
    categoryCount: { width: '20%', padding: 4, textAlign: 'right' },
    categoryAmount: { width: '20%', padding: 4, textAlign: 'right' },
    categoryKm: { width: '20%', padding: 4, textAlign: 'right' },
});

export default function ExpenseReportPDF({ expenses, summary, byCategory, filters, sellerName, categoryName }: any) {
    return (
        <Document>
            <Page size="A4" orientation="landscape" style={styles.page}>
                <Text style={styles.title}>Relatório de despesas</Text>
                <Text style={styles.subtitle}>
                    {moment(filters.start_date).format('DD/MM/YYYY')} a {moment(filters.end_date).format('DD/MM/YYYY')}
                    {' | '}{sellerName ?? 'Toda a equipe'}{' | '}{categoryName ?? 'Todas as categorias'}
                </Text>

                <View style={styles.summary}>
                    <Card label="Total em despesas" value={`R$ ${maskMoney(summary.amount)}`} />
                    <Card label="Quilômetros" value={`${Number(summary.kilometers).toLocaleString('pt-BR')} km`} />
                    <Card label="Lançamentos" value={String(summary.count)} />
                </View>

                {byCategory.length > 0 && (
                    <>
                        <Text style={styles.sectionTitle}>Resumo por categoria</Text>
                        <View style={[styles.row, styles.header]}>
                            <Text style={styles.categoryName}>Categoria</Text>
                            <Text style={styles.categoryCount}>Lançamentos</Text>
                            <Text style={styles.categoryAmount}>Valor</Text>
                            <Text style={styles.categoryKm}>Km</Text>
                        </View>
                        {byCategory.map((category: any) => (
                            <View key={category.category} style={styles.row} wrap={false}>
                                <Text style={styles.categoryName}>{category.label}</Text>
                                <Text style={styles.categoryCount}>{category.count}</Text>
                                <Text style={styles.categoryAmount}>R$ {maskMoney(category.amount)}</Text>
                                <Text style={styles.categoryKm}>{Number(category.kilometers).toLocaleString('pt-BR')} km</Text>
                            </View>
                        ))}
                    </>
                )}

                <Text style={styles.sectionTitle}>Lançamentos</Text>
                <View style={[styles.row, styles.header]}>
                    <Text style={styles.date}>Data</Text>
                    <Text style={styles.seller}>Vendedor</Text>
                    <Text style={styles.category}>Categoria</Text>
                    <Text style={styles.details}>Detalhes</Text>
                    <Text style={styles.amount}>Valor</Text>
                    <Text style={styles.km}>Km</Text>
                </View>
                {expenses.map((expense: any) => (
                    <View key={expense.id} style={styles.row} wrap={false}>
                        <Text style={styles.date}>{moment(expense.expense_date).format('DD/MM/YYYY')}</Text>
                        <Text style={styles.seller}>{expense.user?.name ?? '-'}</Text>
                        <Text style={styles.category}>{categoryLabels[expense.category] ?? expense.category}</Text>
                        <Text style={styles.details}>{expense.category === 'mileage' ? '-' : expense.description || '-'}</Text>
                        <Text style={styles.amount}>R$ {maskMoney(expense.amount)}</Text>
                        <Text style={styles.km}>{expense.kilometers ? `${Number(expense.kilometers).toLocaleString('pt-BR')} km` : '-'}</Text>
                    </View>
                ))}
            </Page>
        </Document>
    );
}

function Card({ label, value }: { label: string; value: string }) {
    return <View style={styles.card}><Text style={styles.cardLabel}>{label}</Text><Text style={styles.cardValue}>{value}</Text></View>;
}
