import { products } from './products'

describe('Cosmetics Products Mock Data', () => {
  test('should have a list of products', () => {
    expect(Array.isArray(products)).toBe(true)
    expect(products.length).toBeGreaterThan(0)
  })

  test('each product should have required fields', () => {
    products.forEach((product) => {
      expect(product).toHaveProperty('id')
      expect(product).toHaveProperty('name')
      expect(product).toHaveProperty('subtitle')
      expect(product).toHaveProperty('price')
      expect(typeof product.price).toBe('number')
      expect(product).toHaveProperty('formattedPrice')
      expect(product).toHaveProperty('category')
      expect(product).toHaveProperty('image')
      expect(product).toHaveProperty('stock')
      expect(product).toHaveProperty('rating')
    })
  })

  test('prices should be positive numbers', () => {
    products.forEach((product) => {
      expect(product.price).toBeGreaterThan(0)
    })
  })

  test('ratings should be between 0 and 5', () => {
    products.forEach((product) => {
      expect(product.rating).toBeGreaterThanOrEqual(0)
      expect(product.rating).toBeLessThanOrEqual(5)
    })
  })
})
