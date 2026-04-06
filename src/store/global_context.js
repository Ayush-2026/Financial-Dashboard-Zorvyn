import {create} from 'zustand';
import initialTransactions from '../assets/transactions';
import {devtools, persist} from 'zustand/middleware'

const useTransactionStore = create(
    persist(
        (set) => ({
            transactions: initialTransactions,

            addTransaction: (transaction) => 
                set((state)=>({
                    transactions:[transaction, ...state.transactions],
                })),

                removeTransaction:(id)=>
                    set((state)=>({
                        transactions:state.transactions.filter((t)=>t.id!==id),
                    })),

                    editTransaction:(id)=>
                        set((state)=>{
                            transactions: state.transactions.map((t)=>t.id === updatedTransaction.id ? updatedTransaction : t)
                        })
        }),
        {name:'transaction-storage'}
    )
) 

export default useTransactionStore;