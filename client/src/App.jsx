import { useState, useEffect } from 'react'

const CATEGORIES = ['food', 'travel', 'bills', 'shopping', 'other']

function App() {
  const [expenses, setExpenses] = useState([])
  const [summary, setSummary] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('food')
  const [formError, setFormError] = useState('')

  const loadExpenses = async (category) => {
    setLoading(true)
    setError('')
    try {
      const url =
        category === 'all'
          ? 'http://localhost:3000/api/expenses'
          : 'http://localhost:3000/api/expenses?category=' + category
      const res = await fetch(url)
      if (!res.ok) {
        throw new Error('Failed to load expenses')
      }
      const data = await res.json()
      setExpenses(data)
    } catch (err) {
      setError('Could not load expenses. Is the server running?')
    } finally {
      setLoading(false)
    }
  }

  const loadSummary = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/expenses/summary')
      if (!res.ok) {
        throw new Error('Failed to load summary')
      }
      const data = await res.json()
      setSummary(data)
    } catch (err) {
      setError('Could not load summary.')
    }
  }

  useEffect(() => {
    loadExpenses(filter)
  }, [filter])

  useEffect(() => {
    loadSummary()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')

    try {
      const res = await fetch('http://localhost:3000/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, amount: Number(amount), category }),
      })

      if (!res.ok) {
        const data = await res.json()
        setFormError(data.error || 'Could not add expense')
        return
      }

      setTitle('')
      setAmount('')
      setCategory('food')
      await loadExpenses(filter)
      await loadSummary()
    } catch (err) {
      setFormError('Server error. Please try again.')
    }
  }

  const handleDelete = async (id) => {
    try {
      const res = await fetch('http://localhost:3000/api/expenses/' + id, {
        method: 'DELETE',
      })
      if (!res.ok) {
        setError('Could not delete expense')
        return
      }
      setExpenses(expenses.filter((exp) => exp._id !== id))
      await loadSummary()
    } catch (err) {
      setError('Server error while deleting')
    }
  }

  const grandTotal = summary.reduce((sum, item) => sum + item.total, 0)

  return (
    <div>
      <h1>Expense Tracker</h1>

      <h2>Add Expense</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Title: </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div>
          <label>Amount: </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        <div>
          <label>Category: </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
        <button type="submit">Add</button>
      </form>
      {formError && <p>{formError}</p>}

      <h2>Summary</h2>
      <table>
        <thead>
          <tr>
            <th>Category</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {summary.map((item) => (
            <tr key={item.category}>
              <td>{item.category}</td>
              <td>{item.total}</td>
            </tr>
          ))}
          <tr>
            <td>Grand Total</td>
            <td>{grandTotal}</td>
          </tr>
        </tbody>
      </table>

      <h2>Expenses</h2>
      <label>Filter by category: </label>
      <select value={filter} onChange={(e) => setFilter(e.target.value)}>
        <option value="all">All</option>
        {CATEGORIES.map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </select>

      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>{error}</p>
      ) : expenses.length === 0 ? (
        <p>No expenses yet</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Amount</th>
              <th>Category</th>
              <th>Date</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((exp) => (
              <tr key={exp._id}>
                <td>{exp.title}</td>
                <td>{exp.amount}</td>
                <td>{exp.category}</td>
                <td>{new Date(exp.createdAt).toLocaleDateString()}</td>
                <td>
                  <button onClick={() => handleDelete(exp._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default App
