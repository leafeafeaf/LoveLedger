import torch
import os

PROJECT_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_PROJECT_DIR = os.path.dirname(PROJECT_DIR)

device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
path = os.path.join(ROOT_PROJECT_DIR, 'data/uncased_test.csv')

def get_loss_fn(loss_function: str):
    return 'CrossEntropyLoss'

if __name__ == '__main__':
    pass