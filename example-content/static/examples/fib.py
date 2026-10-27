"""Shown in the writing-features post: a fence with file=examples/fib.py def=fib pulls this function in at build time."""


def fib(n: int) -> int:
    """The n-th Fibonacci number, iteratively."""
    a, b = 0, 1
    for _ in range(n):
        a, b = b, a + b
    return a


if __name__ == "__main__":
    print([fib(n) for n in range(10)])
