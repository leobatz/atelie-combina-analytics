import database from '../config/database.js';
import { Clientes, Pedidos, ItensPedido } from '../models/relacionamentos.js';

// Migração aditiva para quem já criou Pedidos com a versão inicial do model.
// Não utiliza force, alter ou exclusão de dados. Pode ser executada novamente.
try {
    await database.authenticate();
    const queryInterface = database.getQueryInterface();

    await database.transaction(async (transaction) => {
        const tabelas = await queryInterface.showAllTables({ transaction });
        if (tabelas.includes(Pedidos.tableName)) {
            const colunas = await queryInterface.describeTable(Pedidos.tableName, { transaction });
            if (!colunas.canceladoEm) {
                await queryInterface.addColumn(Pedidos.tableName, 'canceladoEm', {
                    type: Pedidos.rawAttributes.canceladoEm.type,
                    allowNull: true,
                }, { transaction });
            }
        }

        await database.sync({ transaction });

        const referencias = [
            { model: Pedidos, coluna: 'clienteId', destino: Clientes, onDelete: 'RESTRICT' },
            { model: ItensPedido, coluna: 'pedidoId', destino: Pedidos, onDelete: 'CASCADE' },
        ];
        for (const { model, coluna, destino, onDelete } of referencias) {
            const chaves = await queryInterface.getForeignKeyReferencesForTable(model.tableName, { transaction });
            const existente = chaves.find((chave) => chave.columnName === coluna);
            if (existente) {
                if (existente.referencedTableName !== destino.tableName || existente.referencedColumnName !== 'id') {
                    throw new Error(`O relacionamento ${model.tableName}.${coluna} já aponta para outra tabela. Revise-o antes de continuar.`);
                }
                continue;
            }
            await queryInterface.addConstraint(model.tableName, {
                fields: [coluna], type: 'foreign key',
                name: `${model.tableName}_${coluna}_fkey`,
                references: { table: destino.tableName, field: 'id' },
                onUpdate: 'CASCADE', onDelete, transaction,
            });
        }
    });
    console.log('Tabelas e relacionamentos de pedidos preparados com sucesso.');
} catch (error) {
    console.error('Não foi possível preparar pedidos:', error.message);
    console.error('Se já houver pedidos, verifique se todos os clienteId correspondem a clientes existentes. Nenhum registro foi apagado.');
    process.exitCode = 1;
} finally {
    await database.close();
}
