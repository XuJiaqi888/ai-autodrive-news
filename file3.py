import numpy as np

# Read input matrices from user
print("Enter the first matrix:")
matrix1=[]
p=input().split()
while len(p)!=0:
    tmp=[int(i)for i in p]
    matrix1.append(tmp)
    p=input().split()
matrix1=np.array(matrix1)

print("Enter the second matrix")
matrix2=[]
p=input().split()
while len(p)!=0:
    tmp=[int(i)for i in p]
    matrix2.append(tmp)
    p=input().split()
matrix2=np.array(matrix2)


max_pos_matrix1 = np.argmax(matrix1, axis=1)
max_pos_matrix2 = np.argmax(matrix2, axis=1)

# Print the positions of maximum numbers
print("Max position of the first matrix:", [i+1 for i in max_pos_matrix1])
print("Max position of the second matrix:", [i+1 for i in max_pos_matrix2])

# Multiply the two matrices
result = np.matmul(matrix1, matrix2)

# Print the multiplication result
print("Multiplication result:")
print(result)

